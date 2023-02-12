import { AuthenticationError } from 'apollo-server-express'
import { User } from '../models'
import { signToken } from '../utils/auth'

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
        removeBook: async (parent, { userId }) => {
            return User.findOneAndDelete({ _id: userId })
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