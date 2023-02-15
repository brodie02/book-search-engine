const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')

                return userData;
            }

            throw new AuthenticationError('Not logged in.')
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return {token, user}
        },
        saveBook: async (parent, { book }, context) => {
            if (context.user) {
                const addBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true }
                );

                return addBook;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const removeBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );

                return removeBook;
            }

            throw new AuthenticationError('You need to be logged in!');
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email })
    
            if (!user) {
                throw new AuthenticationError('No user found with this email address')
            }

            const correctPw = await user.isCorrectPassword(password)

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Password')
            }

            const token = signToken(user)

            return { token, user}
        }
    }
}

module.exports = resolvers