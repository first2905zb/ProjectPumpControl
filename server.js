var express = require('express')
var cors = require('cors')
var app = express()

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'control'
})
app.use(express.json())
app.use(cors())

app.get('/control', function (req, res, next) {
    connection.query(
        'SELECT * FROM waterNeeds',
        function (err, results, fields) {
            // console.log(results);
            // console.log(fields)
            res.json(results)
            
        }
    )
})

app.post('/control', function (req, res, next) {
    const values = [
        req.body.tankName,
        req.body.need,
    ];
    connection.query(
        'INSERT INTO waterNeeds (`tankName`, `need`) VALUES (?, ?)',
        values,
        function (err, result) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(200).json({ message: 'Data inserted successfully', data: values });
            }
        }
    );
});

app.post('/control/products', function (req, res, next) {
    const products = req.body.map(item => [item.name, item.waterRequire]);

    connection.query(
        'INSERT INTO products (`name`, `waterRequire`) VALUES ?',
        [products],
        function (err, result) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(200).json({ message: 'Data inserted successfully', data: req.body });
            }
        }
    );
});

app.listen(5000, function () {
    console.log('CORS-enabled web server listening on port 5000')
})