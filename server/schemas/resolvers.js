const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, { userId }) => {
            return User.findOne({ _id: userId })
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return {token, user}
        },
        saveBook: async (parent, { userId, book }) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { $addToSet: { savedBooks: book } },
                { new: true, runValidators: true }
            );
            return updatedUser
        },
        removeBook: async (parent, { userId, bookId }) => {
            return User.findOneAndUpdate(
                { _id: userId },
                {
                    $pull: {
                        savedBooks: {
                            bookId: bookId
                        }
                    }
                },
                { new: true }
            )
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