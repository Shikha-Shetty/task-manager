const express = require('express');  //Import Express module
const fs = require("fs"); //Import file system module
const taskData = require('./task.json'); //Import in-memory data store (array) to store the tasks
const Validator = require('./helpers/validator');

const app = express(); // Start a new express application
app.use(express.json()); //Middleware function to parse json

const port = 3000;

//API to retrieve all tasks
app.get('/tasks', (req, res) => {
    return res.status(200).json(taskData);
});

//API to retrieve a single task by its ID
app.get('/tasks/:id', (req, res) => {
    const listOfTasks = taskData.tasks;
    let filteredTask = listOfTasks.filter(task => task.id == req.params.id);
    if (filteredTask.length == 0) {
        return res.status(404).send("No appropriate task found for your query");
    }
    return res.status(200).json(filteredTask);
});

//API to create a new task
app.post('/tasks', (req, res) => {
    const userProvidedDetails = req.body;
    if (Validator.validateTaskInfo(userProvidedDetails).status == true) {
        let taskDataModified = taskData;
        taskDataModified.tasks.push(userProvidedDetails);
        fs.writeFile('./task.json', JSON.stringify(taskDataModified), { encoding: 'utf8', flag: 'w' }, (err, data) => {
            if (err) {
                return res.status(500).send("Something went wrong while writing the course to the file, please try recreating the task");
            } else {
                return res.status(201).send("Task has been successfuly validated and created");
            }
        });
    } else {
        return res.status(400).json(Validator.validateTaskInfo(userProvidedDetails));
    }
});

//API to update an existing task by its ID.
app.put("/tasks/:id", (req, res) => {
    const userUpdatedDetails = req.body;
    if (Validator.validateTaskInfo(userUpdatedDetails).status == true) {
        const id = req.params.id;
        const task = taskData.tasks.find((tasks) => tasks.id === parseInt(id));
        if (task == undefined) {
            return res.status(404).send("No appropriate task found for your query");
        }
        task.id = req.body.id;
        task.title = req.body.title;
        task.description = req.body.description;
        task.completed = req.body.completed;
        return res.status(200).send("Task has been successfuly updated");
    } else {
        return res.status(400).json(Validator.validateTaskInfo(userUpdatedDetails));
    }
});

//API to delete a task by its ID.
app.delete("/tasks/:id", (req, res) => {
    const id = req.params.id;
    const task = taskData.tasks.find((tasks) => tasks.id === parseInt(id));
    if (task == undefined) {
        return res.status(404).send("No appropriate task found for your query");
    }
    const index = taskData.tasks.indexOf(task);
    taskData.tasks.splice(index, 1);
    return res.status(200).send("Task has been deleted successfully");
});


app.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${port}`);
});