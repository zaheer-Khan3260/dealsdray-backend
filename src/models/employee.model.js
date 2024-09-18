import mongoose, {Schema} from "mongoose"

const employeeSchema = new Schema(
    {   
        email: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        
        name: {
            type: String,
            require: true,
            trim: true,
            index: true
        },
       mobileno: {
            type: Number,
            require: true,
            unique: true,
            index: true
        },
        designation: {
            type: String,
            require: true,
            trim: true
        },
        gender: {
            type: String,
            require: true,
            trim: true
        },
        
        course: {
                type: String,
                require: true,
                trim: true
        },

        image: {
            type: String,
            require: true,
            trim: true
        }
        
         
    },
    {
        timestamps: true
    }
)


export const Employee = mongoose.model("Employee", employeeSchema);