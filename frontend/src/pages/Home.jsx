import React, { useEffect, useState } from "react";
import { useUser } from "../context/user.context";
import axios from "../config/axios";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const { user, setUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const navigate = useNavigate();
  const handleCreateProject = async (e) => {
    e.preventDefault();
    await axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        // console.log(res.data);
        setIsModalOpen(false);
        setProjectName(null);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        // console.log(res.data.projects);
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <main className="p-4">
      {/* Projects Section */}
      <div className="projects grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* New Project Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="project flex flex-col items-center justify-center p-4 border border-slate-300 rounded-md hover:bg-blue-100 transition-colors"
        >
          <span>New Project</span>
          <i className="ri-add-line mt-2 text-xl"></i>
        </button>

        {/* Project Cards */}
        {project.map((project) => (
          <div
            key={project._id}
            onClick={() =>
              navigate("/project", {
                state: { project },
              })
            }
            className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-[200px] hover:bg-slate-200 transition-all"
          >
            <h2 className="font-semibold text-lg truncate">{project.name}</h2>
            <div className="flex items-center gap-2 text-sm">
              <p>
                <small>
                  <i className="ri-user-line"></i> Collaborators
                </small>
              </p>
              <span>{project.users.length}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              {/* Project Name Input */}
              <div className="mb-4">
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
