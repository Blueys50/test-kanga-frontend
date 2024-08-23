import React, { useEffect, useState } from "react";
import "./App.css";
import Modal from "./Modal/Modal";
import { noRecipeImage } from './Resource/noRecipeImage'; 
import audio from "./Resource/ding.mp3";


function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    tag: "",
    image: "",
  });

  const dingAudio = new Audio(audio);

  useEffect(() => {
    getRecipeList();
  }, []);

  const getRecipeList = async () => {
    await fetch("https://blueys50.pythonanywhere.com/api/books/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div class="loading-state">
        <div class="loading"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  let color = ["pink", "blue", "orange", "green"];

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const truncateText = (words, wordLimit) => {
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit) + "...";
    }
    return words;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.id) {
      await updateRecipe();
    } else {
      await addRecipe();
    }
    setFormData(null);
    closeModal();
    getRecipeList();
  };

  const deleteRecipe = async (e) => {
    setLoading(true);
    await fetch(
      `https://blueys50.pythonanywhere.com/api/books/${formData.id}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    closeModal();
    await getRecipeList();
  };

  const updateRecipe = async (e) => {
    let data = {
      ...formData,
    };
    if (!data.image) {
      delete data.image;
    }
    await fetch(
      `https://blueys50.pythonanywhere.com/api/books/${formData.id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      }
    );
  };

  const addRecipe = async (e) => {
    let data = {
      ...formData,
    };
    if (!data.image) {
      delete data.image;
    }
    delete data.id;

    await fetch(`https://blueys50.pythonanywhere.com/api/books/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const onChange = (e) => {
    debugger;
    console.log("file uploaded: ", e.target.files[0]);
    let file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = _handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  };

  const _handleReaderLoaded = (e) => {
    console.log("file uploaded 2: ", e);
    let binaryString = e.target.result;
    setFormData({
      ...formData,
      image: `data:image/png;base64,${btoa(binaryString)}`,
    });
  };

  return (
    <body>
      <main class="main">
        <div class="add-wrapper">
          <button
            class="add"
            onClick={() => {
              dingAudio.play();
              setFormData({
                id: "",
                title: "",
                description: "",
                tag: "",
                image: "",
              });
              setIsModalOpen(true);
            }}
          >
            Add New Recipe
          </button>
        </div>
        <div class="scroll">
          <section class="card-area">
            {data.map((e, idx) => (
              <section class="card-section">
                <div class="card">
                  <div class="flip-card">
                    <div class="flip-card__container">
                      <div class="card-front">
                        <div
                          class={`card-front__tp card-front__tp--${
                            color[idx % 4]
                          }`}
                        >
                          <img
                            class="card-front__icon"
                            src={!!e.image ? e.image : noRecipeImage}
                            alt="recipe"
                          />

                          <h2 class="card-front__heading">
                            {truncateText(e.title, 15)}
                          </h2>
                          <p class="card-front__text-price">
                            {truncateText(e.tag, 15)}
                          </p>
                        </div>

                        <div class="card-front__bt">
                          <p
                            class={`card-front__text-view card-front__text-view--${
                              color[idx % 4]
                            }`}
                          >
                            View me
                          </p>
                        </div>
                      </div>
                      <div class="card-back">
                        {
                          <img
                            class="back-img"
                            src={!!e.image ? e.image : noRecipeImage}
                            alt="recipe"
                          />
                        }
                      </div>
                    </div>
                  </div>

                  <div class="inside-page">
                    <div class="inside-page__container">
                      <h3
                        class={`inside-page__heading inside-page__heading--${
                          color[idx % 4]
                        }`}
                      >
                        {truncateText(e.title, 10)}
                      </h3>
                      <p class="inside-page__text">{e.description}</p>
                      <a
                        onClick={() => {
                          dingAudio.play();
                          setFormData(e);
                          setIsModalOpen(true);
                        }}
                        class={`inside-page__btn inside-page__btn--${
                          color[idx % 4]
                        }`}
                      >
                        Edit
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </section>
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Recipe">
        {isModalOpen ? (
          <form onSubmit={handleSubmit}>
            <div>
              <img
                src={!!formData?.image ? formData.image : noRecipeImage}
                class="modal-img"
              ></img>
            </div>
            <div class="left">
              <label>
                Update Image:
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => onChange(e)}
                />
              </label>
            </div>
            <div class="left">
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength="50"
                  required
                />
              </label>
            </div>
            <div class="left">
              <label>
                Description:
                <textarea
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength="300"
                  required
                />
              </label>
            </div>
            <div class="left">
              <label>
                Tag:
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  maxLength="50"
                  required
                />
              </label>
            </div>
            <div class="button-wrapper">
              <button
                onClick={() => {
                  setFormData(null);
                  closeModal();
                }}
              >
                Cancel
              </button>
              <button type="submit">Submit</button>
              {formData.id ? (
                <button
                  onClick={async () => {
                    await deleteRecipe();
                  }}
                >
                  Delete
                </button>
              ) : (
                ""
              )}
            </div>
          </form>
        ) : (
          ""
        )}
      </Modal>
    </body>
  );
}
export default App;
    