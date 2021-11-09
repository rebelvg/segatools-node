import * as passport from 'koa-passport';
import { OAuth2Strategy } from 'passport-google-oauth';

import { CONFIG, GOOGLE } from '../config';
import { User } from '../models/user';
import { usersCollection } from '../mongo';

passport.use(
  new OAuth2Strategy(
    {
      clientID: GOOGLE.CLIENT_ID,
      clientSecret: GOOGLE.CLIENT_SECRET,
      callbackURL: `${CONFIG.SERVER.googleCallbackHost}/users/auth/google/callback`,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      const { koaCtx } = req as any;

      try {
        const user = await User.findByGoogleId(profile.id);

        if (user) {
          await usersCollection().updateOne(
            { _id: user._id },
            {
              $set: {
                emails: profile.emails,
                name: profile.displayName,
                ipUpdated: koaCtx.ip,
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
          ipCreated: koaCtx.ip
        });

        await usersCollection().insertOne(newUser);

        done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
);
