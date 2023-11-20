import { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import axios from "axios";

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: "", link: "" });

  useEffect(() => {
    // Fetch todos from the server
    axios.get("http://localhost:400/api/todos").then((response) => {
      setTodos(response.data);
    });
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedTodos = Array.from(todos);
    const [reorderedTodo] = updatedTodos.splice(result.source.index, 1);
    updatedTodos.splice(result.destination.index, 0, reorderedTodo);

    // Update positions and save to the server
    updatedTodos.forEach(async (todo, index) => {
      await axios.put(`http://localhost:400/api/todos/${todo._id}`, {
        position: index,
      });
    });

    setTodos(updatedTodos);
  };

  const handleAddTodo = async () => {
    if (newTodo.title.trim() !== "" && newTodo.link.trim() !== "") {
      try {
        const response = await axios.post(
          "http://localhost:400/api/todos",
          newTodo
        );
        setTodos([...todos, response.data]);
        setNewTodo({ title: "", link: "" });
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  const handleToggleCheck = async (id, checked) => {
    try {
      const response = await axios.put(`http://localhost:400/api/todos/${id}`, {
        checked,
      });
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === response.data._id ? response.data : todo
        )
      );
    } catch (error) {
      console.error("Error toggling check:", error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:400/api/todos/${id}`);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <input
          type="text"
          placeholder="Title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Link"
          value={newTodo.link}
          onChange={(e) => setNewTodo({ ...newTodo, link: e.target.value })}
        />
        <button onClick={handleAddTodo}>Add Todo</button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {todos.map((todo, index) => (
                <Draggable key={todo._id} draggableId={todo._id} index={index}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <input
                        type="checkbox"
                        checked={todo.checked}
                        onChange={() =>
                          handleToggleCheck(todo._id, !todo.checked)
                        }
                      />
                      <span
                        style={{
                          textDecoration: todo.checked
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {todo.title}
                      </span>
                      <button onClick={() => handleDeleteTodo(todo._id)}>
                        Delete
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
};

export default Dashboard;
