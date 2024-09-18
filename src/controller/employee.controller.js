import { Employee } from '../models/employee.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/Cloudinary.js';  
import mongoose from 'mongoose';

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

const getAllEmployees = asyncHandler(async (req, res) => {
    const {
        search,
        status,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null }
        ];
    }

    if (status) {
        query.status = status === 'active';
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    const totalEmployees = await Employee.countDocuments(query);

    if (!employees.length) {
        throw new ApiError(404, "No employees found");
    }

    res.status(200).json(
        new ApiResponse(200, {
            employees,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalEmployees / limit),
            totalEmployees
        }, "Employees retrieved successfully")
    );
});

const getEmployeeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Employee ID is required");
    }

    const employee = await Employee.findById(id);

    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    return res.status(200).json(
        new ApiResponse(200, employee, "Employee fetched successfully")
    );
});



export { createEmployee, editEmployee, deleteEmployee, getAllEmployees,getEmployeeById };