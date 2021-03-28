const express = require('express');
require('dotenv/config');
const app = express();
const cors = require('cors');
const Sequelize = require("sequelize");
const db = require("./models/index");
const projectRoutes = require('./routes/project/projectRoutes');
const taskRoutes = require('./routes/project/taskRoutes.js');
const taskCommentRoutes = require('./routes/project/taskCommentRoutes.js');
const taskChangeLogRoutes = require('./routes/project/taskChangeLogRoutes.js');
const userRoutes = require('./routes/user/userRoutes.js');
const authRoutes = require('./routes/auth/authRoutes.js');
const groupRoutes = require('./routes/user/groupRoutes.js');

db.sequelize.sync();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
    app.use(cors({origin: 'http://localhost:8080'}));
}

app.use('/projects', projectRoutes);
app.use('/projects', taskRoutes);
app.use('/tasks', taskCommentRoutes);
app.use('/tasks', taskChangeLogRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/groups', groupRoutes);

app.get('/', (req, res) => {
    res.send('Api index');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`listening on port ${port}...`)
});

//nodeamon index.js