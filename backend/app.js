const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const connectMongoDB = require("./db/connection");
const dotenv =require( "dotenv");
const multer = require('multer');
const path = require('path');
dotenv.config();
const io = require('socket.io')(8080, {
    cors: {
        origin: 'https://blackapp-1.onrender.com',
        methods: ['GET', 'POST'],
    credentials: true, 
    }
});



// Import Files
const Users = require('./models/Users');
const Conversations = require('./models/Conversations');
const Messages = require('./models/Messages');

// app Use
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'https://blackapp-1.onrender.com', // Allow only your frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

const port = process.env.PORT || 8000;
connectMongoDB()

// Multer setup for profile picture upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/');  // Directory where files will be saved
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // File name
    }
});

const upload = multer({ storage: storage });
app.use('/upload', express.static('upload'));


// Socket.io
let users = [];
io.on('connection', socket => {
    console.log('User connected', socket.id);
    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await Users.findById(senderId);
        console.log('sender :>> ', sender, receiver);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, fullName: user.fullName, email: user.email }
            });
            }else {
                io.to(sender.socketId).emit('getMessage', {
                    senderId,
                    message,
                    conversationId,
                    receiverId,
                    user: { id: user._id, fullName: user.fullName, email: user.email }
                });
            }
        });

        // Join a chat room
    socket.on('joinRoom', roomId => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Leave a chat room
    socket.on('leaveRoom', roomId => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
    });

    // Send a message to a room
    socket.on('sendRoomMessage', async ({ senderId, roomId, message }) => {
        const user = await Users.findById(senderId);
        io.to(roomId).emit('getRoomMessage', {
            senderId,
            message,
            roomId,
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    });

    // Event to handle incoming call
    socket.on('initiateCall', ({ receiverId, stream }) => {
        const receiver = users.find(user => user.userId === receiverId);
        if (receiver) {
            io.to(receiver.socketId).emit('incomingCall', { callerId: socket.id, stream });
        }
    });

    // Event to handle accepting the call
    socket.on('acceptCall', ({ callerId, stream }) => {
        const caller = users.find(user => user.socketId === callerId);
        if (caller) {
            io.to(caller.socketId).emit('callAccepted', stream);
        }
    });

    // Event to handle rejecting the call
    socket.on('rejectCall', (callerId) => {
        const caller = users.find(user => user.socketId === callerId);
        if (caller) {
            io.to(caller.socketId).emit('callRejected');
        }
    });
    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
    // io.emit('getUsers', socket.userId);
});


// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
        req.user = decoded; // Attach user data to the request object
        next();
    });
};


// Protect your route with the verifyToken middleware
app.get('/api/auth/user', verifyToken, (req, res) => {
    // The user data can now be accessed via req.user
    res.json({ user: req.user });
});




// Routes

app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        const isAlreadyExist = await Users.findOne({ email });
        if (isAlreadyExist) {
            return res.status(400).send('User already exists');
        } else {
            const newUser = new Users({ fullName, email });
            bcryptjs.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).send('Error hashing password');
                }
                newUser.set('password', hashedPassword);
                newUser.save().then(() => {
                    return res.status(200).send('User registered successfully');
                });
            });
        }
    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Error registering user');
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Please fill all required fields');
        }

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).send('User email or password is incorrect');
        }

        const validateUser = await bcryptjs.compare(password, user.password);
        if (!validateUser) {
            return res.status(400).send('User email or password is incorrect');
        }

        const payload = { userId: user._id, email: user.email };
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'THIS_IS_A_JWT_SECRET_KEY';

        jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 84600 }, async (err, token) => {
            if (err) {
                return res.status(500).send('Error generating JWT');
            }
            await Users.updateOne({ _id: user._id }, { $set: { token } });
            return res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }, token });
        });
    } catch (error) {
        console.log(error, 'Error');
        res.status(500).send('Error logging in');
    }
});


// Route to handle profile picture upload
app.post('/api/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
    try {
        const { userId } = req.body;  // Assuming userId is sent in the request body

        // If file is uploaded
        if (req.file) {
            const fileUrl = `/upload/${req.file.filename}`;  // URL to access the image

            // Update the user's profile picture in the database
            await Users.updateOne({ _id: userId }, {
                $set: { profilePic: fileUrl }
            });

            return res.status(200).json({ message: 'Profile picture uploaded successfully', fileUrl });
        } else {
            return res.status(400).json({ message: 'No file uploaded' });
        }
    } catch (error) {
        console.log(error, 'Error');
        res.status(500).json({ message: 'Server error' });
    }
});


app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newCoversation = new Conversations({ members: [senderId, receiverId] });
        await newCoversation.save();
        res.status(200).send('Conversation created successfully');
    } catch (error) {
        console.log(error, 'Error')
    }
})

app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversations.find({ members: { $in: [userId] } });
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user = await Users.findById(receiverId);
            return { user: { receiverId: user._id, email: user.email, fullName: user.fullName }, conversationId: conversation._id }
        }))
        res.status(200).json(await conversationUserData);
    } catch (error) {
        console.log(error, 'Error')
    }
})

app.post('/api/message', async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body;
        if (!senderId || !message) return res.status(400).send('Please fill all required fields')
        if (conversationId === 'new' && receiverId) {
            const newCoversation = new Conversations({ members: [senderId, receiverId] });
            await newCoversation.save();
            const newMessage = new Messages({ conversationId: newCoversation._id, senderId, message });
            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        } else if (!conversationId && !receiverId) {
            return res.status(400).send('Please fill all required fields')
        }
        const newMessage = new Messages({ conversationId, senderId, message });
        await newMessage.save();
        res.status(200).send('Message sent successfully');
    } catch (error) {
        console.log(error, 'Error')
    }
})

app.get('/api/message/:conversationId', async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            console.log(conversationId, 'conversationId')
            const messages = await Messages.find({ conversationId });
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await Users.findById(message.senderId);
                return { user: { id: user._id, email: user.email, fullName: user.fullName }, message: message.message }
            }));
            res.status(200).json(await messageUserData);
        }
        const conversationId = req.params.conversationId;
        if (conversationId === 'new') {
            const checkConversation = await Conversations.find({ members: { $all: [req.query.senderId, req.query.receiverId] } });
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id);
            } else {
                return res.status(200).json([])
            }
        } else {
            checkMessages(conversationId);
        }
    } catch (error) {
        console.log('Error', error)
    }
})

app.get('/api/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const users = await Users.find({ _id: { $ne: userId } });
        const usersData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, fullName: user.fullName, receiverId: user._id } }
        }))
        res.status(200).json(await usersData);
    } catch (error) {
        console.log('Error', error)
    }
})

app.listen(port, () => {
    console.log('listening on port ' + port);
})