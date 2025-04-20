const express = require("express")
const router = express.Router({mergeParams: true})
const wrapAsync = require("../utils/wrapAsync")
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")
const ReviewController = require("../controllers/reviews.js")

// Create Review Route

router.post("/",isLoggedIn,validateReview,wrapAsync(ReviewController.createReview))

// Delete review

router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(ReviewController.destroyReview))

module.exports = router;