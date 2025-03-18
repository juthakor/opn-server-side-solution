const express = require('express');
const app = express();
app.use(express.json());

let userProfile = {
    email: 'yod.y@example.com',
    password: 'secret',
    name: 'Yod Yiam',
    dob: '1999-09-09',
    gender: 'male',
    address: '123/456 Dindaeng, Bangkok',
    newsletter: true
};

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (authHeader === 'Bearer faketoken_user1') {
        next();
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

function isValidEmail(email) {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
}

const allowedGenders = ['male', 'female', 'other'];

app.post('/register', (req, res) => {
    const { email, password, name, dob, gender, address, newsletter } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    if (!dob || isNaN(Date.parse(dob))) {
        return res.status(400).json({ error: 'Valid date of birth is required' });
    }

    if (!gender || !allowedGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({ error: 'Gender must be one of: male, female, other' });
    }

    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }

    if (newsletter !== undefined && typeof newsletter !== 'boolean') {
        return res.status(400).json({ error: 'Newsletter must be a boolean' });
    }

    const newUser = {
        email,
        password,
        name,
        dob,
        gender: gender.toLowerCase(),
        address,
        newsletter: newsletter !== undefined ? newsletter : false
    };

    userProfile = newUser;

    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

app.get('/profile', authMiddleware, (req, res) => {
    const dob = new Date(userProfile.dob);
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    res.json({
        email: userProfile.email,
        name: userProfile.name,
        age,
        gender: userProfile.gender,
        address: userProfile.address,
        newsletter: userProfile.newsletter
    });
});

app.put('/profile', authMiddleware, (req, res) => {
    const { dob, gender, address, newsletter } = req.body;

    if (dob && isNaN(Date.parse(dob))) {
        return res.status(400).json({ error: 'Invalid date format for dob' });
    }

    if (gender && !allowedGenders.includes(gender.toLowerCase())) {
        return res.status(400).json({ error: 'Gender must be one of: male, female, other' });
    }

    if (newsletter !== undefined && typeof newsletter !== 'boolean') {
        return res.status(400).json({ error: 'Newsletter must be a boolean' });
    }

    userProfile.dob = dob || userProfile.dob;
    userProfile.gender = gender ? gender.toLowerCase() : userProfile.gender;
    userProfile.address = address || userProfile.address;
    userProfile.newsletter = (newsletter !== undefined) ? newsletter : userProfile.newsletter;

    res.json({ message: 'Profile updated successfully', user: userProfile });
});

app.delete('/profile', authMiddleware, (req, res) => {
    userProfile = {};

    res.json({ message: 'User account deleted successfully' });
});

app.put('/change-password', authMiddleware, (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'All password fields are required' });
    }

    if (currentPassword !== userProfile.password) {
        return res.status(400).json({ error: 'Current password is incorrect' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New password and confirmation do not match' });
    }

    userProfile.password = newPassword;

    res.json({ message: 'Password changed successfully' });
});


module.exports = app;
