const request = require('supertest');
const app = require('./app');

describe('User API Integration Tests', () => {
    const validUserData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dob: '1990-01-01',
        gender: 'male',
        address: '123 Test Ave, Test City',
        newsletter: true
    };

    describe('POST /register', () => {
        test('should register a new user with valid data', async () => {
            const res = await request(app).post('/register').send(validUserData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.message).toEqual('User registered successfully');
            expect(res.body.user.email).toEqual(validUserData.email);
        });

        test('should return error when email is missing', async () => {
            const { email, ...dataWithoutEmail } = validUserData;
            const res = await request(app).post('/register').send(dataWithoutEmail);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Email is required');
        });

        test('should return error when email is invalid', async () => {
            const data = { ...validUserData, email: 'invalid-email' };
            const res = await request(app).post('/register').send(data);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Invalid email format');
        });

        test('should return error when name is missing', async () => {
            const { name, ...dataWithoutName } = validUserData;
            const res = await request(app).post('/register').send(dataWithoutName);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Name is required');
        });

        test('should return error when dob is missing', async () => {
            const { dob, ...dataWithoutDob } = validUserData;
            const res = await request(app).post('/register').send(dataWithoutDob);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Valid date of birth is required');
        });

        test('should return error when dob is invalid', async () => {
            const data = { ...validUserData, dob: 'not-a-date' };
            const res = await request(app).post('/register').send(data);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Valid date of birth is required');
        });

        test('should return error when address is missing', async () => {
            const { address, ...dataWithoutAddress } = validUserData;
            const res = await request(app).post('/register').send(dataWithoutAddress);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Address is required');
        });

        test('should return error when gender is missing', async () => {
            const { gender, ...dataWithoutGender } = validUserData;
            const res = await request(app).post('/register').send(dataWithoutGender);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Gender must be one of: male, female, other');
        });

        test('should return error when gender is invalid', async () => {
            const data = { ...validUserData, gender: 'unknown' };
            const res = await request(app).post('/register').send(data);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Gender must be one of: male, female, other');
        });

        test('should return error when newsletter is not a boolean', async () => {
            const data = { ...validUserData, newsletter: 'yes' };
            const res = await request(app).post('/register').send(data);

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Newsletter must be a boolean');
        });
    });


    describe('GET /profile', () => {
        test('should return 401 if token is missing', async () => {
            const res = await request(app).get('/profile');

            expect(res.statusCode).toEqual(401);
            expect(res.body.error).toEqual('Unauthorized');
        });

        test('should return user profile when token is provided', async () => {
            await request(app).post('/register').send(validUserData);

            const res = await request(app)
                .get('/profile')
                .set('Authorization', 'Bearer faketoken_user1');

            expect(res.statusCode).toEqual(200);
            expect(res.body.email).toEqual(validUserData.email);
            expect(res.body.name).toEqual(validUserData.name);
            expect(typeof res.body.age).toEqual('number');
        });
    });

    describe('PUT /profile', () => {
        test('should update user profile with valid data', async () => {
            await request(app).post('/register').send(validUserData);

            const updateData = {
                dob: '1991-02-02',
                gender: 'female',
                address: '456 New Ave, New City',
                newsletter: false
            };

            const res = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer faketoken_user1')
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Profile updated successfully');
            expect(res.body.user.dob).toEqual(updateData.dob);
            expect(res.body.user.gender).toEqual('female');
            expect(res.body.user.address).toEqual(updateData.address);
            expect(res.body.user.newsletter).toEqual(updateData.newsletter);
        });

        test('should return error for invalid dob', async () => {
            await request(app).post('/register').send(validUserData);

            const res = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer faketoken_user1')
                .send({ dob: 'invalid-date' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Invalid date format for dob');
        });

        test('should return error for invalid gender', async () => {
            await request(app).post('/register').send(validUserData);

            const res = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer faketoken_user1')
                .send({ gender: 'unknown' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Gender must be one of: male, female, other');
        });

        test('should return error for invalid newsletter value', async () => {
            await request(app).post('/register').send(validUserData);

            const res = await request(app)
                .put('/profile')
                .set('Authorization', 'Bearer faketoken_user1')
                .send({ newsletter: 'not-a-boolean' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Newsletter must be a boolean');
        });
    });


    describe('DELETE /profile', () => {
        test('should delete the user account', async () => {
            await request(app).post('/register').send(validUserData);

            const res = await request(app)
                .delete('/profile')
                .set('Authorization', 'Bearer faketoken_user1');

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('User account deleted successfully');
        });
    });

    describe('PUT /change-password', () => {
        test('should change the password with valid data', async () => {
            await request(app).post('/register').send(validUserData);

            const res = await request(app)
                .put('/change-password')
                .set('Authorization', 'Bearer faketoken_user1')
                .send({
                    currentPassword: validUserData.password,
                    newPassword: 'newpassword123',
                    confirmPassword: 'newpassword123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Password changed successfully');
        });

        test('should return error when current password is incorrect', async () => {
            await request(app).post('/register').send(validUserData);

            const res = await request(app)
                .put('/change-password')
                .set('Authorization', 'Bearer faketoken_user1')
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123',
                    confirmPassword: 'newpassword123'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('Current password is incorrect');
        });

        test('should return error when new password and confirmation do not match', async () => {
            await request(app).post('/register').send(validUserData);

            const res = await request(app)
                .put('/change-password')
                .set('Authorization', 'Bearer faketoken_user1')
                .send({
                    currentPassword: validUserData.password,
                    newPassword: 'newpassword123',
                    confirmPassword: 'differentpassword'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.error).toEqual('New password and confirmation do not match');
        });
    });
});
