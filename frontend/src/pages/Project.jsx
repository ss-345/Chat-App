import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import { initializeSocket, reciveMessage, sendMessage } from "../config/socket";
import { useUser } from "../context/user.context";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";
import { getWebContainer } from "../config/webContainer";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = ({ navigate }) => {
  const location = useLocation();
  // console.log(location.state);
  const [isSidePanelOpen, setSidePanelOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState(
    location.state?.project?.users
  );
  const [project, setProject] = useState(location.state?.project);
  const [inputMessage, setInputMessage] = useState("");
  const { user, setUser } = useUser();
  const messageBox = useRef();
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeURL, setIframeURL] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleUserSelect = (id) => {
    // console.log(id);
    // console.log(users);
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };
  const toggleSidePanel = () => {
    // console.log("Toggling side panel");
    setSidePanelOpen(!isSidePanelOpen);
  };
  const handleAddUsers = async () => {
    await axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: selectedUserIds,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleOnMessageSend = async () => {
    // console.log(user);
    sendMessage("project-message", { inputMessage, sender: user });
    // appendOutgoingMessage({ inputMessage, user });
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: user, inputMessage },
    ]);
    setInputMessage("");
  };
  function WriteAiMessage(message) {
    let messageObject;

    try {
      // Try parsing the message as JSON
      messageObject = JSON.parse(message);
    } catch (error) {
      // If parsing fails, treat the message as plain text
      console.error("Invalid JSON received from AI:", error);
      messageObject = { text: message }; // Wrap plain text in a standard format
    }
    return (
      <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
        <Markdown
          children={messageObject.text} // Concatenate text and code with line breaks
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }
  // const appendIncomingMessage = (messageObject) => {
  //   const messageBox = document.querySelector(".message-box");
  //   const message = document.createElement("div");
  //   message.classList.add(
  //     "message",
  //     "max-w-60",
  //     "flex",
  //     "flex-col",
  //     "p-2",
  //     "w-fit",
  //     "rounded-md",
  //     "border",
  //     "bg-white",
  //     "break-words"
  //   );
  //   if (messageObject.sender._id === "ai") {
  //     const markDown = <Markdown>{messageObject.inputMessage}</Markdown>;
  //     message.innerHTML = `
  //     <small className="text-sm font-semibold text-blue-800">${messageObject.sender.email}</small>
  //             <p className="text-xs pt-1">
  //               ${markDown}
  //             </p>
  //   `;
  //   } else {
  //     message.innerHTML = `
  //     <small className="text-sm font-semibold text-blue-800">${messageObject.sender.email}</small>
  //             <p className="text-xs pt-1">
  //               ${messageObject.inputMessage}
  //             </p>
  //   `;
  //   }

  //   messageBox.appendChild(message);
  //   scrollToBottom();
  // };
  // const appendOutgoingMessage = (messageObject) => {
  //   // console.log(messageObject);
  //   const messageBox = document.querySelector(".message-box");
  //   const message = document.createElement("div");
  //   message.classList.add(
  //     "message",
  //     "max-w-60",
  //     "flex",
  //     "flex-col",
  //     "p-2",
  //     "w-fit",
  //     "rounded-md",
  //     "border",
  //     "bg-white",
  //     "ml-auto",
  //     "break-words"
  //   );
  //   message.innerHTML = `
  //     <small className="text-sm font-semibold ">${messageObject.user.email}</small>
  //             <p className="text-xs pt-1">
  //               ${messageObject.inputMessage}
  //             </p>
  //   `;
  //   messageBox.appendChild(message);
  //   scrollToBottom();
  // };
  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }
  const handleClose = (file) => {
    setOpenFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((f) => f !== file);
      setCurrentFile(updatedFiles.length > 0 ? updatedFiles[0] : null);
      return updatedFiles;
    });
  };
  const saveFileTree = async (ft) => {
    console.log(ft);
    await axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    initializeSocket(project?._id);
    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("container started");
      });
    }
    reciveMessage("project-message", (data) => {
      console.log(data);
      try {
        const message = JSON.parse(data.inputMessage);
        webContainer?.mount(message?.fileTree);
        if (message.fileTree) {
          setFileTree(message.fileTree);
          setOpenFiles([]);
        }
      } catch (error) {}

      setMessages((prevMessages) => [...prevMessages, data]);
    });
    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        // console.log(res.data.projectDetails);
        setProject(res.data.projectDetails);
        setFileTree(res.data.projectDetails.fileTree);
        setMessages(res.data.projectDetails.messages);
        setOpenFiles([]);
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get("/users/all")
      .then((res) => {
        // console.log(res.data.allUsers);
        setUsers(res.data.allUsers);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    scrollToBottom();
    if (messages.length > 0) {
      // console.log(messages)
      axios
        .put("/projects/update-messages", {
          projectId: project._id,
          messages,
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [messages]);
  return (
    <main className="h-screen w-screen flex flex-col lg:flex-row">
      <section className="left relative h-full lg:h-screen min-w-full lg:min-w-80 bg-slate-200 flex flex-col">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0">
          <button className="flex gap-2" onClick={() => setModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>
          <button onClick={toggleSidePanel} className="p-2">
            <i className="ri-group-fill"></i>
          </button>
        </header>
        {/* Conversation Box */}
        <div className="conversation pt-14 h-full flex flex-col flex-grow relative overflow-y-auto">
          <div
            ref={messageBox}
            className="message-box p-1 flex flex-col flex-grow gap-1 overflow-y-auto"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender._id === "ai" ? "max-w-80" : "max-w-52"
                } ${
                  msg.sender._id === user._id.toString() && "ml-auto"
                } message flex flex-col p-2 bg-slate-50 w-fit rounded-md break-words`}
              >
                <small className="opacity-65 text-xs text-blue-600">
                  {msg.sender.email}
                </small>
                <div className="text-sm">
                  {msg.sender._id === "ai" ? (
                    WriteAiMessage(msg.inputMessage)
                  ) : (
                    <p>{msg.inputMessage}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="input w-full flex sticky bottom-0 bg-white border-t">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="p-2 border-none outline-none flex-grow"
              type="text"
              placeholder="Enter your text here"
            />
            <button
              className="bg-blue-400 p-2 flex items-center justify-center"
              onClick={handleOnMessageSend}
            >
              <i className="ri-send-plane-2-fill"></i>
            </button>
          </div>
        </div>
        <div
          className={`sidepanel absolute top-0 h-full w-full bg-slate-400 transform transition-transform duration-300 ${
            isSidePanelOpen ? "translate-x-0" : "translate-x-[-100%]"
          }`}
        >
          <header className="p-4 bg-slate-300">
            <h2 className="text-white font-bold ">Collaborators</h2>
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={toggleSidePanel}
            >
              <i className="ri-close-line"></i>
            </button>
          </header>

          <div className="users mt-2 flex flex-col gap-1">
            {project?.users &&
              project.users.map((user) => {
                return (
                  <div
                    key={user._id}
                    className="user cursor-pointer px-2 py-1 flex gap-2 hover:bg-slate-200"
                  >
                    <div className="logo aspect-square rounded-full flex items-center justify-center w-fit h-fit p-4 bg-slate-50">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <div className="name font-semibold">{user.email}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <section className="right flex-grow h-full lg:h-screen flex flex-col lg:flex-row">
        <div className="explorer max-w-full lg:max-w-64 bg-slate-300 h-full overflow-y-auto">
          <div className="file-tree flex flex-col gap-1 p-2">
            {fileTree &&
              Object.keys(fileTree).map((file, index) => {
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentFile(file);
                      setOpenFiles([...new Set([...openFiles, file])]);
                    }}
                    className="tree-element bg-slate-200 px-4 cursor-pointer"
                  >
                    <p className="text-lg font-semibold">{file}</p>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="code-editor flex flex-col h-full flex-grow">
          <div className="top flex justify-between overflow-auto">
            <div className="files flex overflow-x-auto">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 justify-between ${
                    currentFile === file ? "bg-slate-400" : ""
                  }`}
                >
                  <p className="font-semibold text-lg">{file}</p>
                  <button
                    className="file-cross p-1 cursor-pointer hover:text-black hover:bg-slate-200 rounded-full"
                    onClick={() => {
                      handleClose(file);
                    }}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </button>
              ))}
            </div>
            <div className="buttons flex gap-2">
              <button
                className="px-4 py-2 bg-blue-400 rounded-md font-bold"
                onClick={async () => {
                  await webContainer?.mount(fileTree);

                  const installProcess = await webContainer.spawn("npm", [
                    "install",
                  ]);
                  installProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      },
                    })
                  );
                  await webContainer.spawn("npx", ["kill-port", "3000"]);
                  if (runProcess) {
                    runProcess.kill();
                  }
                  const tempRunProcess = await webContainer.spawn("npm", [
                    "start",
                  ]);
                  setRunProcess(tempRunProcess);
                  tempRunProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      },
                    })
                  );

                  webContainer.on("server-ready", (port, url) => {
                    console.log({ port, url });
                    setIframeURL(url);
                  });
                }}
              >
                Run
              </button>
            </div>
          </div>
          <div className="bottom h-full w-full flex-grow overflow-auto">
            {currentFile && fileTree[currentFile] && (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50 p-4">
                <pre className="hljs h-full">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent,
                          },
                        },
                      };
                      setFileTree(ft);
                      saveFileTree(ft);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        "javascript",
                        fileTree[currentFile]?.file?.contents
                      ).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            )}
          </div>
        </div>
        {iframeURL && webContainer && (
          <div className="flex flex-col h-full w-full lg:max-w-80">
            <div className="address-bar">
              <input
                className="w-full p-2 bg-gray-200 rounded-md border-none outline-none"
                type="text"
                placeholder="Enter url"
                value={iframeURL}
                onChange={(e) => {
                  setIframeURL(e.target.value);
                }}
              />
            </div>
            <iframe
              src={iframeURL}
              className="h-full w-full border-t border-gray-300"
            ></iframe>
          </div>
        )}
      </section>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center ">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md relative">
            <header className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Select Users</h2>
              <button
                className="text-slate-400 text-xl"
                onClick={handleCloseModal}
              >
                <i className="ri-close-line"></i>
              </button>
            </header>
            <div className="p-4 max-h-80 overflow-auto">
              <ul className="space-y-2">
                {users.map((user) => (
                  <li
                    key={user._id}
                    className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                      selectedUserIds.includes(user._id)
                        ? "bg-blue-200"
                        : "bg-gray-100 hover:bg-blue-100"
                    }`}
                    onClick={() => handleUserSelect(user._id)}
                  >
                    <span>{user.email}</span>
                    <i className="ri-user-add-fill"></i>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="sticky bottom-0 w-full bg-blue-500 text-white py-2 rounded-b-lg hover:bg-blue-600"
              onClick={handleAddUsers}
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
