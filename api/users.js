const router = require('express').Router();

const { getBusinessesByOwnerId } = require('../models/business');
const { getReviewsByUserId } = require('../models/review');
const { getPhotosByUserId } = require('../models/photo');
const mysqlPool = require('../lib/mysqlPool');
const bcrypt = require('bcryptjs');
const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { UserSchema, insertNewUser, getUserById, validateUser } = require('../models/user'); 

//insert new user into sqldb
router.post('/', async (req, res) => {
  console.log("trying to insert a new user into the db");
  if (validateAgainstSchema(req.body, UserSchema)) {
    try {
      const id = await insertNewUser(req.body);
      res.status(201).send({
        _id: id
      });
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error inserting new user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body does not contain a valid User."
    });
  }
});

//route to login
router.post('/login', async (req,res,next) => {
  //users/login
  if(req.body && req.body.id && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.id, req.body.password);
      if(authenticated) {
        res.status(200).send({
          token: generateAuthToken(req.body.id)
        });
      } else {
        res.status(401).send({
          error: "Invalid authentication credentials."
        });
      }
    } catch (err) {
      console.error(" ---- error:", err);
      res.status(500).send({
        error: "Error logging in. Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body needs `id` and `password`."
    })
  }
});

//route to get user from an id
router.get('/:id', requireAuthentication, async (req, res, next) => {
  console.log(" --- req.user:", req.user);
  console.log(" --- req.params.id:",req.params.id);
  if (req.user !== req.params.id) {
    //different user is logged in
    console.log(" --- user and id DO NOT MATCH!");
    res.status(403).send({
      error: "Unauthorized to access the specific resource"
    });
  } else {
    try {
      console.log(" --- user and id match!");
      const user = await getUserById(req.params.id);
      if (user) {
        res.status(200).send(user);
      } else {
        next();
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
  }
});

/*
 * Route to list all of a user's businesses.
 */
router.get('/:id/businesses', requireAuthentication, async (req, res, next) => {
  const user = await getUserById(parseInt(req.user), false);
  if(req.user !== req.params.id) {
    console.log(" -- req.user and req.params.id DONT MATCH!");
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  }
  else {
    try {
      const businesses = await getBusinessesByOwnerId(parseInt(req.params.id));
      if (businesses) {
        res.status(200).send({ businesses: businesses });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch businesses.  Please try again later."
      });
    }
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:id/reviews', requireAuthentication, async (req, res, next) => {
  const user = await getUserById(parseInt(req.user), false);
  if(req.user !== req.params.id) {
    console.log(" -- req.user and req.params.id DONT MATCH!");
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  } else {
    try {
      const reviews = await getReviewsByUserId(parseInt(req.params.id));
      if (reviews) {
        res.status(200).send({ reviews: reviews });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch reviews.  Please try again later."
      });
    }
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:id/photos', requireAuthentication, async (req, res, next) => {
  const user = await getUserById(parseInt(req.user), false);
  if(req.user !== req.params.id) {
    console.log(" -- req.user and req.params.id DONT MATCH!");
    res.status(403).send({
      error: "Unauthorized to access the specified resource"
    });
  } else {
    try {
      const photos = await getPhotosByUserId(parseInt(req.params.id));
      if (photos) {
        res.status(200).send({ photos: photos });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Unable to fetch photos.  Please try again later."
      });
    }
  }
});

module.exports = router;
