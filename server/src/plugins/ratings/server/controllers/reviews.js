'use strict';
const utils = require('@strapi/utils');
const { sanitize } = utils;

/**
 *   controller
 */

module.exports = {
    async find(ctx) {
        const { slug } = ctx.params;
        const { user } = ctx.state;
        const { start } = ctx.request.query;
        const pageSize = await strapi
            .service('plugin::ratings.review')
            .getPageSize();
        let reviews = await strapi.entityService.findMany(
            'plugin::ratings.review',
            {
                filters: { related_to: { slug } },
                limit: pageSize,
                start,
                sort: { createdAt: 'DESC' },
                populate: {
                    author: { fields: ['id', 'username', 'email'] },
                },
            }
        );
        let reviewsCount = 0;
        let averageScore = 0;
        let userReview = null;

        const score = await strapi.db
            .query('plugin::ratings.r-content-id')
            .findOne({
                select: ['average', 'count'],
                where: { slug },
            });
        if (score) {
            reviewsCount = score.count;
            averageScore = score.average;
        } else {
            await strapi.entityService.create('plugin::ratings.r-content-id', {
                data: { slug },
                populate: {
                    reviews: { fields: ['id'] },
                },
            });
        }

        // Check whether the user has already posted a review
        if (user) {
            userReview = await strapi.db
                .query('plugin::ratings.review')
                .findMany({
                    select: ['id', 'createdAt', 'comment', 'score'],
                    where: {
                        related_to: { slug },
                        author: user.id,
                    },
                    populate: {
                        author: { select: ['id', 'username', 'email'] },
                    },
                });
            if (userReview) {
                // Exclude user review
                reviews = reviews.filter((r) => r.id !== userReview.id);
            }
        }
        ctx.body = {
            reviewsCount,
            averageScore,
            userReview,
            reviews,
        };
    },
    async create(ctx) {
        const { user } = ctx.state;
        if (!user) {
            return ctx.badRequest('The user should be authenticated');
        }
        const { slug } = ctx.params;

        const userCanPostReview = await strapi
            .service('plugin::ratings.review')
            .userCanPostReview(user, slug);

        if (!userCanPostReview) {
            return ctx.forbidden('User cannot post a review on this content');
        }

        const { comment, score } = ctx.request.body;
        if (!score || score < 0 || score > 5) {
            return ctx.badRequest('Score should be between 0-5', {
                slug,
                comment,
                score,
            });
        }
        // Only one review per user is allowed.
        // Check if the user has already posted a review.
        // const review = await strapi.db.query("plugin::ratings.review").findOne({
        //   select: ["id"],
        //   where: {
        //     related_to: { slug },
        //     author: user.id
        //   }
        // })
        // if (review) {
        //   return ctx.badRequest("User already posted a review. Review ID:", review.id)
        // }
        // Get data of related content with the given slug
        // If not exists, this is the fist review
        // - create the contentID and grab the ID
        let relatedContent = await strapi.db
            .query('plugin::ratings.r-content-id')
            .findOne({
                select: ['id', 'average', 'count'],
                where: { slug },
            });
        if (!relatedContent) {
            // First review ever for this content
            relatedContent = await strapi.entityService.create(
                'plugin::ratings.r-content-id',
                {
                    data: { slug },
                    populate: {
                        reviews: { fields: ['id'] },
                    },
                }
            );
        }
        // Create review and associate it with id.
        const newReview = await strapi.entityService.create(
            'plugin::ratings.review',
            {
                data: {
                    author: user.id,
                    comment,
                    score,
                    related_to: relatedContent.id,
                },
            }
        );
        // Update average rating
        const oldTotalScore = relatedContent.average * relatedContent.count;
        const newAvg =
            (oldTotalScore + parseFloat(score)) / (relatedContent.count + 1);
        await strapi.entityService.update(
            'plugin::ratings.r-content-id',
            relatedContent.id,
            {
                data: {
                    average: newAvg,
                    count: relatedContent.count + 1,
                },
            }
        );
        ctx.body = { id: newReview.id };
    },
    async getPageSize() {
        const pageSize = await strapi
            .service('plugin::ratings.review')
            .getPageSize();
        return { pageSize };
    },
    async count(ctx) {
        const { slug } = ctx.params;
        // count reviews related to this content
        const reviewsCount = await strapi.db
            .query('plugin::ratings.review')
            .findOne({
                select: ['count'],
                where: { slug },
            });
        return {
            count: reviewsCount.count,
        };
    },
    async getStats(ctx) {
        const { slug } = ctx.params;
        let averageScore = 0;
        let reviewsCount = 0;
        const score = await strapi.db
            .query('plugin::ratings.r-content-id')
            .findOne({
                select: ['id', 'average', 'count'],
                where: { slug },
            });
        if (score) {
            averageScore = score.average;
            reviewsCount = score.count;
        }
        ctx.body = {
            averageScore,
            reviewsCount,
        };
    },
    async getUserReview(ctx) {
        const { slug } = ctx.params;
        const { user, auth } = ctx.state;
        if (!user) {
            return ctx.badRequest('User unauthenticated');
        }
        const review = await strapi.db
            .query('plugin::ratings.review')
            .findMany({
                select: ['id', 'createdAt', 'comment', 'score'],
                where: {
                    related_to: { slug },
                    author: user.id,
                },
                populate: {
                    author: { select: ['id', 'username', 'email'] },
                },
            });
        ctx.body = {
            review: await sanitize.contentAPI.output(
                review,
                strapi.getModel('plugin::ratings.review')
            ),
        };
    },
    async update(ctx) {
        const { user } = ctx.state;
        if (!user) {
            return ctx.badRequest('The user should be authenticated');
        }
        const id = ctx.params.id;
        const review = await strapi.entityService.findOne(
            'plugin::ratings.review',
            id,
            {
                populate: {
                    author: true,
                    related_to: true,
                },
            }
        );
        if (!review) {
            return ctx.badRequest('Review not found');
        }
        if (review.author.id !== user.id) {
            return ctx.forbidden('User cannot update this review');
        }
        const { comment, score } = ctx.request.body;
        if (!score) {
            return ctx.badRequest('Score should be between 1-5', {
                comment,
                score,
            });
        }
        // Update review
        await strapi.entityService.update(
            'plugin::ratings.review',
            ctx.params.id,
            {
                data: {
                    comment,
                    score,
                },
            }
        );
        // Update average rating
        const relatedContent = await strapi.db
            .query('plugin::ratings.r-content-id')
            .findOne({
                select: ['id', 'average', 'count'],
                where: { id: review.related_to.id },
            });
        const oldTotalScore = relatedContent.average * relatedContent.count;
        const newAvg =
            (oldTotalScore + parseFloat(score) - review.score) /
            relatedContent.count;
        await strapi.entityService.update(
            'plugin::ratings.r-content-id',
            relatedContent.id,
            {
                data: {
                    average: newAvg,
                },
            }
        );
        ctx.body = { id: review.id };
    },
    async delete(ctx) {
        const { user } = ctx.state;
        if (!user) {
            return ctx.badRequest('The user should be authenticated');
        }
        const id = ctx.params.id;
        const review = await strapi.entityService.findOne(
            'plugin::ratings.review',
            id,
            {
                populate: {
                    author: true,
                    related_to: true,
                },
            }
        );
        if (!review) {
            return ctx.badRequest('Review not found');
        }
        if (review.author.id !== user.id) {
            return ctx.forbidden('User cannot delete this review');
        }
        // Delete review
        await strapi.entityService.delete(
            'plugin::ratings.review',
            ctx.params.id
        );
        // Update average rating
        const relatedContent = await strapi.db
            .query('plugin::ratings.r-content-id')
            .findOne({
                select: ['id', 'average', 'count'],
                where: { id: review.related_to.id },
            });
        const oldTotalScore = relatedContent.average * relatedContent.count;
        const newAvg =
            relatedContent.count === 1
                ? 0
                : (oldTotalScore - review.score) / (relatedContent.count - 1);
        await strapi.entityService.update(
            'plugin::ratings.r-content-id',
            relatedContent.id,
            {
                data: {
                    average: newAvg,
                    count: relatedContent.count - 1,
                },
            }
        );
        ctx.body = {
            id: review.id,
        };
    },
    statsByList: async (ctx) => {
        const { list } = ctx.request.body;
        const stats = await strapi.db
            .query('plugin::ratings.r-content-id')
            .findMany({
                select: ['slug', 'average', 'count'],
                where: { slug: { $in: list } },
            });
        if (stats.length < list.length) {
            const missing = list.filter(
                (slug) => !stats.find((s) => s.slug === slug)
            );
            for (const slug of missing) {
                stats.push({
                    slug,
                    average: 0,
                    count: 0,
                });
                await strapi.entityService.create(
                    'plugin::ratings.r-content-id',
                    {
                        data: { slug },
                        populate: {
                            reviews: { fields: ['id'] },
                        },
                    }
                );
            }
        }
        return stats;
    },
};
