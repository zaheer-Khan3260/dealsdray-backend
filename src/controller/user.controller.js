import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token: " + error)
    }
}

const registerUser = asyncHandler( async (req, res) => {

    const {fullname, email, username, password} = req.body
    if([
        fullname,email,username, password
    ].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All Feilds are required")
    }

    const existedUserName = await User.findOne({username})
    if(existedUserName) return res.status(409).json(new ApiError(409, "Username already existed"));

        
    const user = await User.create({
        fullname,
        email,
        password,
        username,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) throw new ApiError(500, "Failed to create a new User")

        res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
}
)

const loginUser = asyncHandler (async (req,res) => {
    const {email, password, username} = req.body
    if (!username && !email) {
        throw new ApiError(400, "Username or Email required");
    }

    // Find the user by username or email
    const user = username
        ? await User.findOne({ username })
        : await User.findOne({ email });

   if(!user) throw new ApiError(400, "User does not exist , Enter Correct username or email");
   
   const correctPassword = await user.isPasswordCorrect(password);
   if(!correctPassword) throw new ApiError(400, "Password is incorrect")
    
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id);
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const option = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }

    return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse (
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )
    
})


const logoutUser = asyncHandler(async (req, res) => {

    const { _id } = req.user;

    const user = await User.findByIdAndUpdate(
        _id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Clear cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    res.status(200).json(
        new ApiResponse(200, {}, "User logged out successfully")
    );
});


export {
    registerUser,
    loginUser,
    logoutUser
}
