import * as passport from 'koa-passport';
import { OAuth2Strategy } from 'passport-google-oauth';

import { config } from '../config';
import { User } from '../models/user';
import { usersCollection } from '../mongo';

/* tslint:disable:no-var-requires */
const { web } = require('../google-keys');

passport.use(
  new OAuth2Strategy(
    {
      clientID: web.client_id,
      clientSecret: web.client_secret,
      callbackURL: `${config.server.googleCallbackHost}/users/auth/google/callback`,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findByGoogleId(profile.id);

        if (user) {
          await usersCollection().updateOne(
            { _id: user._id },
            {
              $set: {
                emails: profile.emails,
                name: profile.displayName,
                ipUpdated: req.ip,
                updatedAt: new Date()
              }
            }
          );

          return done(null, user);
        }

        const newUser = new User({
          emails: profile.emails,
          googleId: profile.id,
          name: profile.displayName,
          ipCreated: req.ip
        });

        await usersCollection().insertOne(newUser);

        done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
);
