import User from "../models/User.js"
import { StatusCodes } from "http-status-codes"
import HttpError from '../error/HttpError.js'
import { attachCookieToResponse } from "../utils/jwt.js"

const register = async (req, res) => {
    const { email, name, password, faculty } = req.body

    if (!name || !email || !password || !faculty) {
        throw new HttpError('please provide all values', StatusCodes.BAD_REQUEST)
    }

    const check = await User.findOne({ email })
    if (check) {
        throw new HttpError('User with that email already exists!', StatusCodes.BAD_REQUEST)
    }
    const user = await User.create({ email, name, password, faculty })
    const tokenUser = { name: user.name, role: user.role, userId: user._id }

    attachCookieToResponse({ res, user: tokenUser })

    res.status(StatusCodes.CREATED).json({ tokenUser })
}

const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new HttpError('please provide all values', StatusCodes.BAD_REQUEST)
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        throw new HttpError('Couldn\'t find user with that email', StatusCodes.NOT_FOUND)
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new HttpError('invalid email or password', StatusCodes.UNAUTHORIZED)
    }

    const tokenUser = { name: user.name, role: user.role, userId: user._id }
    attachCookieToResponse({ res, user: tokenUser })

    res.status(StatusCodes.OK).json({ tokenUser })
}



export { login, register }