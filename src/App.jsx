import { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: "", link: "" });

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("http://localhost:5000/todos");
      setTodos(response.data);
    };

    fetchData();
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const newTodos = [...todos];
    const [movedTodo] = newTodos.splice(result.source.index, 1);
    newTodos.splice(result.destination.index, 0, movedTodo);

    setTodos(newTodos);

    // Update positions in the backend
    await axios.put(`http://localhost:5000/updateTodo/${movedTodo._id}`, {
      position: result.destination.index,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTodo((prevTodo) => ({ ...prevTodo, [name]: value }));
  };

  const handleAddTodo = async () => {
    if (newTodo.title.trim() !== "") {
      try {
        const response = await axios.post(
          "http://localhost:5000/addTodo",
          newTodo
        );
        setTodos([...todos, response.data]);
        setNewTodo({ title: "", link: "" });
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  const handleUpdateTodo = async (id, updates) => {
    try {
      await axios.put(`http://localhost:5000/updateTodo/${id}`, updates);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/deleteTodo/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleCheckboxChange = async (id, checked) => {
    const updatedTodos = todos.map((todo) =>
      todo._id === id ? { ...todo, checked } : todo
    );
    setTodos(updatedTodos);

    // Update checked status in the backend
    await handleUpdateTodo(id, { checked });
  };

  const handleEditTodo = async (id, title, link) => {
    const updates = {};
    if (title !== undefined) {
      updates.title = title;
    }
    if (link !== undefined) {
      updates.link = link;
    }

    await handleUpdateTodo(id, updates);
  };

  return (
    <div>
      <h1>Todo Dashboard</h1>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={newTodo.title}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="link"
        placeholder="Link"
        value={newTodo.link}
        onChange={handleInputChange}
      />
      <button onClick={handleAddTodo}>Add Todo</button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {todos.map((todo, index) => (
                <Draggable key={todo._id} draggableId={todo._id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <input
                        type="checkbox"
                        checked={todo.checked}
                        onChange={(e) =>
                          handleCheckboxChange(todo._id, e.target.checked)
                        }
                      />
                      <span
                        style={{
                          textDecoration: todo.checked
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {todo.title} - {todo.link}
                      </span>
                      <button onClick={() => handleDeleteTodo(todo._id)}>
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          const newTitle = prompt(
                            "Enter new title:",
                            todo.title
                          );
                          const newLink = prompt("Enter new link:", todo.link);
                          if (newTitle !== null || newLink !== null) {
                            handleEditTodo(todo._id, newTitle, newLink);
                          }
                        }}
                      >
                        Edit
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default App;
