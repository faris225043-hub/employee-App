// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// The supplied project folder is named "Frontend" (capital F, lowercase e).
// Keep this compatible with the provided dist files.
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));

// Task2: create mongoDB connection
const mongoURI = process.env.MONGODB_URI;

mongoose.set('strictQuery', true);

if (!mongoURI) {
    console.warn('MONGODB_URI is not set. Add your MongoDB Atlas connection string to the environment.');
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch((err) => console.error('MongoDB connection error:', err.message));
}

// Employee schema/model
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 }
}, { versionKey: false });

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

// Task 2: write API with error handling and appropriate API mentioned in the TODO below

function ensureDatabaseConnected(req, res, next) {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database is not connected. Check MONGODB_URI and Atlas network access.' });
    }
    next();
}

// TODO: get data from db using api '/api/employeelist'
app.get('/api/employeelist', ensureDatabaseConnected, async (req, res) => {
    try {
        const employees = await Employee.find().sort({ _id: -1 });
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve employees', error: err.message });
    }
});

// TODO: get single data from db using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', ensureDatabaseConnected, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve employee', error: err.message });
    }
});

// TODO: send data to db using api '/api/employeelist'
// Request body format: { name: '', location: '', position: '', salary: '' }
app.post('/api/employeelist', ensureDatabaseConnected, async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        if (!name || !location || !position || salary === undefined || salary === '') {
            return res.status(400).json({ message: 'name, location, position, and salary are required' });
        }
        const numericSalary = Number(salary);
        if (!Number.isFinite(numericSalary) || numericSalary < 0) {
            return res.status(400).json({ message: 'salary must be a valid non-negative number' });
        }
        const employee = await Employee.create({
            name: String(name).trim(),
            location: String(location).trim(),
            position: String(position).trim(),
            salary: numericSalary
        });
        res.status(201).json(employee);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid employee data', error: err.message });
        }
        res.status(500).json({ message: 'Failed to add employee', error: err.message });
    }
});

// TODO: delete an employee by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', ensureDatabaseConnected, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully', employee });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete employee', error: err.message });
    }
});

// TODO: update employee data using api '/api/employeelist'
// Request body format: { name: '', location: '', position: '', salary: '' }
// The provided frontend sends the employee object in the request body, including its _id.
app.put('/api/employeelist', ensureDatabaseConnected, async (req, res) => {
    try {
        const { _id, id, name, location, position, salary } = req.body;
        const employeeId = _id || id;
        if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
            return res.status(400).json({ message: 'A valid employee _id is required in the request body' });
        }

        const updates = {};
        if (name !== undefined) updates.name = String(name).trim();
        if (location !== undefined) updates.location = String(location).trim();
        if (position !== undefined) updates.position = String(position).trim();
        if (salary !== undefined && salary !== '') {
            const numericSalary = Number(salary);
            if (!Number.isFinite(numericSalary) || numericSalary < 0) {
                return res.status(400).json({ message: 'salary must be a valid non-negative number' });
            }
            updates.salary = numericSalary;
        }

        const employee = await Employee.findByIdAndUpdate(employeeId, updates, {
            new: true,
            runValidators: true
        });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid employee data', error: err.message });
        }
        res.status(500).json({ message: 'Failed to update employee', error: err.message });
    }
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Employee App server listening on port ${PORT}`);
});
