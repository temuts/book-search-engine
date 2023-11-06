const { AuthenticationError } = require('apollo-server');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const secret = 'mysecretsshhhhh'; // This should be in your .env file
const bcrypt = require('bcrypt');


const generateToken = (user) => {
  return jwt.sign({ data: user }, secret, { expiresIn: '2h' });
};

const resolvers = {
  Query: {

    me: async (_, __, context) => {
      if (context.user) {
        return await User.findById(context.user._id);
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const correctPw = await bcrypt.compare(password, user.password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = generateToken(user);
      return { token, user };
    },

    addUser: async (_, { username, email, password }) => {
      const user = new User({ username, email, password });
      const saltRounds = 10; 
      user.password = await bcrypt.hash(user.password, saltRounds);
      await user.save();
      const token = generateToken(user);
      return { token, user };
    },

    saveBook: async (_, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $push: { savedBooks: input } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
