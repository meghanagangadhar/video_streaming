
const express = require('express');

const cors = require('cors');

const path = require('path');

const { AccessToken, LiveKitAPI } = require('livekit-server-sdk');

require('dotenv').config();


// Read Environment Variables

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;

const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

const LIVEKIT_URL = process.env.LIVEKIT_URL;



const app = express();




app.use(cors());




app.use(express.json());


// =============================================
// Serve Angular App (built files)
// =============================================
const angularPath = path.join(__dirname, '..', 'prav-video-demo', 'dist', 'prav-video-demo', 'browser');
app.use(express.static(angularPath));



// API health check
app.get('/api-status', (req, res) => {
    res.send('LiveKit Token Server is Running');
});


app.post('/create-room', async (req, res) => {

    try {

        const roomName = req.body.roomName
            || 'room-' + Math.random().toString(36).substring(2, 8);

        const api = new LiveKitAPI({
            apiKey: LIVEKIT_API_KEY,
            secret: LIVEKIT_API_SECRET,
            wsUrl: LIVEKIT_URL
        });

        // Create the room on LiveKit server
        const room = await api.room.createRoom({
            name: roomName,
            emptyTimeout: 600,
            maxParticipants: 10
        });

        console.log('Room created:', room);

        res.json({
            roomId: room.name || roomName,
            message: 'Room created successfully'
        });

    } catch (error) {

        console.error('Failed to create room:', error);

        res.status(500).json({
            message: 'Failed to create room'
        });

    }

});


// =============================================
// Generate LiveKit Token
// =============================================

app.get('/token', async (req, res) => {

    try {

       
        const room = req.query.room;

        const identity = req.query.identity;

        if (!room || !identity) {

            return res.status(400).json({

                message: 'room and identity are required'

            });

        }


        // =====================================
        // Create LiveKit Access Token
        // =====================================

        const token = new AccessToken(

            LIVEKIT_API_KEY,

            LIVEKIT_API_SECRET,

            {

                identity: identity,

                name: identity

            }

        );


        // =====================================
        // Allow User to Join Room
        // =====================================

        token.addGrant({

            roomJoin: true,

            room: room

        });


        // =====================================
        // Convert Token to JWT
        // =====================================

        const jwt = await token.toJwt();


        // =====================================
        // Return Token to Angular
        // =====================================

        res.json({

            token: jwt

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: 'Unable to generate LiveKit Token'

        });

    }

});



// =============================================
// Angular catch-all (for client-side routing)
// =============================================
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(angularPath, 'index.html'));
});


app.listen(3000, () => {
    console.log('===================================');
    console.log('Server Started on port 3000');
    console.log('App: http://localhost:3000');
    console.log('===================================');
});