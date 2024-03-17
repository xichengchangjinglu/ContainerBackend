const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: '180.209.98.94',
    user: 'root',
    password: '12345678',
    database: 'container',
    port:8030
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

// 查询所有用户信息
app.get('/queryAllUser', (req, res) => {
    // 查询所有用户信息
    connection.query('SELECT * FROM user', (error, results, fields) => {
        if (error) {
            console.error('Error querying MySQL: ' + error.stack);
            return res.status(500).send('Error querying the database');
        }

        res.json(results);
    });
});

// 查询特定用户名的用户是否存在
app.post('/queryExistUser', (req, res) => {
    console.log(req.body);
    const { username } = req.body;

    connection.query('SELECT * FROM user WHERE username = ?', [username], (error, results, fields) => {
        if (error) {
            console.error('Error querying MySQL: ' + error.stack);
            return res.status(500).send('Error querying the database');
        }

        if (results.length > 0) {
            res.json({
                message: 'User ' + username + ' exists in the database.',
                code: 1
            });
        } else {
            res.json({
                message: 'User ' + username + ' does not exist in the database.',
                code: 0
            });
        }
    });
});

// 注册用户
app.post('/registerUser', (req, res) => {
    const { username, mail, passwd } = req.body;

    connection.query('INSERT INTO user (username, mail, passwd) VALUES (?, ?, ?)', [username, mail, passwd], (error, results, fields) => {
        if (error) {
            console.error('Error querying MySQL: ' + error.stack);
            return res.status(500).json({ message: "注册用户时出错" });
        }

        res.status(201).json({ message: "用户注册成功" });
    });
});

// 修改用户信息
app.put('/updateUser/:username', (req, res) => {
    const username = req.params.username;
    const { mail, passwd } = req.body;

    connection.query('SELECT * FROM user WHERE username = ?', [username], (error, results, fields) => {
        if (error) {
            console.error('Error querying MySQL: ' + error.stack);
            return res.status(500).json({ message: "数据库查询错误" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "用户不存在" });
        } else {
            connection.query('UPDATE user SET mail = ?, passwd = ? WHERE username = ?', [mail, passwd, username], (error, results, fields) => {
                if (error) {
                    console.error('Error querying MySQL: ' + error.stack);
                    return res.status(500).json({ message: "更新用户信息时出错" });
                }

                res.json({ message: "用户信息更新成功" });
            });
        }
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});