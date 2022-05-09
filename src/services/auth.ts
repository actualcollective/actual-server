import jwt from 'jsonwebtoken';
import config from '../config';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { User, UserAttributes, UserModel } from '../models/user';
import { db } from '../loaders/sequelize';
import { QueryTypes } from 'sequelize';

export default class AuthService {
  private generateToken(user) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign(
      {
        id: user.id,
        name: user.username,
        exp: exp.getTime() / 1000,
      },
      config.jwtSecret,
    );
  }

  public async SignUp(input: Partial<UserAttributes>): Promise<{ user: UserModel; token: string }> {
    const salt = randomBytes(32);
    const hashedPassword = await argon2.hash(input.password, { salt });

    let user = await User.findOne({ where: { username: input.username } });

    if (user) {
      throw Error(`User with name ${input.username} already exists.`);
    }

    user = await User.create({
      ...input,
      salt: salt.toString('hex'),
      password: hashedPassword,
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  public async SignIn(username: string, password: string): Promise<{ user: UserModel; token: string }> {
    const users = await db.query<UserModel>('SELECT * FROM "Users" WHERE username = ? LIMIT 1', {
      replacements: [username],
      type: QueryTypes.SELECT,
    });

    if (!users || users.length !== 1) {
      throw Error(`User with name ${username} not registered.`);
    }

    const user = users[0];

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      throw Error('Invalid password');
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  public async ChangePassword(user: Partial<UserModel>, password: string): Promise<{ user: Partial<UserModel> }> {
    const salt = randomBytes(32);
    const hashedPassword = await argon2.hash(password, { salt });

    await User.update({ password: hashedPassword, salt: salt.toString('hex') }, { where: { id: user.id } });

    return { user };
  }
}
