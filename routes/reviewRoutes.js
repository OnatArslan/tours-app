const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require(`./../controllers/authController`);

const router = express.Router({ mergeParams: true }); // mergeParams : true mean that no matter what this router catch the request

// POST /tour/23232/reviews mergeParams

router
  .route(`/`)
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    reviewController.setTourUserId,
    reviewController.createReview
  );

router
  .route(`/:id`)
  .delete(authController.protect, reviewController.deleteReview)
  .patch(authController.protect, reviewController.updateReview)
  .get(authController.protect, reviewController.getReview);

module.exports = router;
