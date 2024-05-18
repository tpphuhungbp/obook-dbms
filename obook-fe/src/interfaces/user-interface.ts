export default interface IUser {
    user_id?: string,
    email?: string,
    password?: string
    firstName?: string,
    lastName?: string
    avatar?: string,
    age?: Number,
    dob?: string,
    sex?: 'male' |'female',
    accessToken?: string
}