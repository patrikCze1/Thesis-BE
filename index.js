const express = require('express');
require('dotenv/config');
const app = express();
const cors = require('cors');
const sequelize = require("./models/index");
const { 
    projectRoutes, 
    clientRoutes, 
    taskRoutes, 
    taskChangeLogRoutes, 
    authRoutes, 
    userRoutes, 
    groupRoutes, 
    todoRoutes, 
    timeTrackRoutes, 
    notificationRoutes, 
    meRoutes }  = require('./routes');

sequelize.sync();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(cors({origin: 'http://localhost:8080'}));
}

app.use('/projects', projectRoutes);
app.use('/clients', clientRoutes);
app.use('/projects', taskRoutes);
app.use('/tasks', taskChangeLogRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/todos', todoRoutes);
app.use('/tracks', timeTrackRoutes);
app.use('/', notificationRoutes);
app.use('/me', meRoutes);

app.get('/', (req, res) => {
    res.send('Api index');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`listening on port ${port}...`)
});

//nodemon index.js
//socket, pwa, graphql
// todo role, turn off motifikace