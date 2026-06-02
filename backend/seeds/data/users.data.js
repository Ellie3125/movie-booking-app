const ADMIN_PASSWORD = 'Admin@123456';
const CUSTOMER_PASSWORD = 'Customer@123456';
const USER_PASSWORD = 'User@123456';

module.exports = [
  {
    _id: '2224e07cbc0d9c3c143c6205',
    fullName: 'Admin',
    email: 'admin@example.com',
    phoneNumber: '0900000000',
    avatarUrl: '/uploads/avatars/avatar_02.png',
    password: ADMIN_PASSWORD,
    role: 'admin',
    isActive: true,
  },
  {
    _id: 'db0be307559ced97749ed5f8',
    fullName: 'Operations Admin',
    email: 'staff@example.com',
    phoneNumber: '0900000001',
    avatarUrl: '/uploads/avatars/avatar_03.png',
    password: ADMIN_PASSWORD,
    role: 'admin',
    isActive: true,
  },
  {
    _id: '85b99d1bf8daad6df13e7655',
    fullName: 'Customer',
    email: 'customer@example.com',
    phoneNumber: '0900000002',
    avatarUrl: '/uploads/avatars/avatar_04.png',
    password: CUSTOMER_PASSWORD,
    role: 'user',
    isActive: true,
  },
  ...Array.from({ length: 17 }, (_, index) => {
    const userNumber = index + 4;
    const avatarNumber = ((index + 4) % 10) + 1;

    return {
      _id: [
        'a85b5e03fd1df993604079e1',
        'ef5e356d6939aa3944cd88db',
        '834c06bb4f637a00eb659413',
        '8e04eadeb1820afd578ffe7c',
        '0893855a528e0162ab6caaf0',
        '1ac849a544138bc6a8cdb87e',
        '8be9a74ce11106c744a34f36',
        '5aa83cfcbcc1a77beace2762',
        '7dd67365120dd1639742fd67',
        '4684d2bb06c1ff781ba5a56c',
        '48a7ba52ca0213a61b4b211c',
        '49898410244c11e612c38613',
        '6a68f5fed6e8cc078ad9f487',
        '8d1a2df5a7004ce7317a8ab7',
        '445df76d95c61c01d8f95176',
        '9f153339b55d127ce71e7120',
        '4a25ac074a4cbf6a8a1ee5b6',
      ][index],
      fullName: `User Customer ${userNumber}`,
      email: `user${userNumber}@gmail.com`,
      phoneNumber: `09000000${String(userNumber).padStart(2, '0')}`,
      avatarUrl: `/uploads/avatars/avatar_${String(avatarNumber).padStart(2, '0')}.png`,
      password: USER_PASSWORD,
      role: 'user',
      isActive: true,
    };
  }),
];
