import { Employee } from '../models/employee.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/Cloudinary.js';  

const createEmployee = asyncHandler(async (req, res) => {
    const { email, name, mobileno, designation, gender, course } = req.body;

    if ([email, name, mobileno, designation, gender, course].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedEmail = await Employee.findOne({ email: email.toLowerCase() });
    if (existedEmail) {
        throw new ApiError(409, "Email already exists");
    }

    const existedMobileNo = await Employee.findOne({ mobileno });
    if (existedMobileNo) {
        throw new ApiError(409, "Mobile number already exists");
    }

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(400, "Image file is required");
    }

    const image = await uploadOnCloudinary(imageLocalPath);

    if (!image) {
        throw new ApiError(500, "Image upload failed");
    }

    const employee = await Employee.create({
        email: email.toLowerCase(),
        name,
        mobileno,
        designation,
        gender,
        course,
        image: image.url
    });

    const createdEmployee = await Employee.findById(employee._id);
    if (!createdEmployee) {
        throw new ApiError(500, "Failed to create a new employee");
    }

    res.status(201).json(
        new ApiResponse(201, createdEmployee, "Employee created successfully")
    );
});

const editEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, name, mobileno, designaton, gender, course } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    if (email && email !== employee.email) {
        const existedEmail = await Employee.findOne({ email: email.toLowerCase() });
        if (existedEmail) {
            throw new ApiError(409, "Email already exists");
        }
        employee.email = email.toLowerCase();
    }

    if (mobileno && mobileno !== employee.mobileno) {
        const existedMobileNo = await Employee.findOne({ mobileno });
        if (existedMobileNo) {
            throw new ApiError(409, "Mobile number already exists");
        }
        employee.mobileno = mobileno;
    }

    if (name) employee.name = name;
    if (designaton) employee.designaton = designaton;
    if (gender) employee.gender = gender;
    if (course) employee.course = course;

    if (req.file) {
        const imageLocalPath = req.file.path;
        const image = await uploadOnCloudinary(imageLocalPath);
        if (!image) {
            throw new ApiError(500, "Image upload failed");
        }
        if (employee.image) {
            await deleteFromCloudinary(employee.image);
        }
        employee.image = image.url;
    }

    await employee.save();

    res.status(200).json(
        new ApiResponse(200, employee, "Employee updated successfully")
    );
});

const deleteEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    if (employee.image) {
        await deleteFromCloudinary(employee.image);
    }

    await Employee.findByIdAndDelete(id);

    res.status(200).json(
        new ApiResponse(200, null, "Employee deleted successfully")
    );
});

export { createEmployee, editEmployee, deleteEmployee };