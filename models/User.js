import mongoose from "mongoose"
import validator from "validator"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'pleaase provide name'],
        maxLength: 20,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'pleaase provide email'],
        validate: {
            validator: validator.isEmail,    //don't invoke pass by reference
            message: 'Please provide a valid email',
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'please provide password'],
        minLength: [6, 'password must be at least 6 characters long'],
        select: false
    },
    faculty: {
        type: String,
        required: [true, 'please provide faculty'],
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user'
    }


}, { timestamps: true })

//note: this is triggered by Model.save() but not by Model.findOneAndUpdate()
UserSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return

    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
})


UserSchema.methods.comparePassword = async function (submittedPassword) {
    const isMatch = await bcrypt.compare(submittedPassword, this.password)
    return isMatch
}

export default mongoose.model('User', UserSchema)