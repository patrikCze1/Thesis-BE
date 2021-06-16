const express = require('express');
require('dotenv/config');
const app = express();
const cors = require('cors');
const sequelize = require("./models/index");
const projectRoutes = require('./routes/project/projectRoutes');
const clientRoutes = require('./routes/project/clientRoutes');
const taskRoutes = require('./routes/task/taskRoutes.js');
const taskAttachmentRoutes = require('./routes/task/taskAttachmentRoutes.js');
const taskCommentRoutes = require('./routes/task/taskCommentRoutes.js');
const taskChangeLogRoutes = require('./routes/task/taskChangeLogRoutes.js');
const timeTrackRoutes = require('./routes/task/timeTrackRoutes.js');
const userRoutes = require('./routes/user/userRoutes.js');
const authRoutes = require('./routes/auth/authRoutes.js');
const groupRoutes = require('./routes/user/groupRoutes.js');
const todoRoutes = require('./routes/todo/todoRoutes.js');
const notificationRoutes = require('./routes/notification/notificationRoutes.js');

sequelize.sync();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(cors({origin: 'http://localhost:8080'}));
}

app.use('/projects', projectRoutes);
app.use('/clients', clientRoutes);
app.use('/projects', taskRoutes);
app.use('/tasks', taskAttachmentRoutes);
app.use('/tasks', taskCommentRoutes);
app.use('/tasks', taskChangeLogRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);
app.use('/todos', todoRoutes);
app.use('/tracks', timeTrackRoutes);
app.use('/', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Api index');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`listening on port ${port}...`)
});

//nodemon index.js
//socket, pwa, graphql
// todo auth routes