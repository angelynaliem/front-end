// Import Dependencies
import React, { useState } from "react";
import * as yup from "yup";
import { gsap } from "gsap";
import axiosWithAuth from "../utilities/axiosWithAuth";
import { useHistory } from "react-router-dom";

export default function Login() {
  // Declare a variable holding the default empty data
  const defaultUserData = { username: "", password: "" };

  const { push } = useHistory();
  // Get the state to hold the form data
  const [user, setUser] = useState(defaultUserData);

  // Set the state for the errors for validation
  const [errors, setErrors] = useState({});

  // Set state for to disable submit button
  const [disableSubmit, setDisableSubmit] = useState(false);

  // Function to handle the text field change to set to the user state
  const handleChange = (e) => {
    const userData = { ...user, [e.target.name]: e.target.value };

    setUser(userData);
  };

  // Form schema to be used for form validation
  const formSchema = yup.object().shape({
    username: yup.string().required("Please enter a username."),
    password: yup.string().required("Please enter a password."),
  });

  // Form to catch any errors if the form did not validated
  const formErrors = (e) => {
    // Make a copy of the errors state
    let allErrors = { ...errors };

    // Cycle through all data and check
    for (const userData in user) {
      yup
        .reach(formSchema, userData)
        .validate(user[userData])
        .then((valid) => {
          allErrors[`${userData}`] = "";
        })
        .catch((err) => {
          allErrors[`${userData}`] = err.errors[0];
        });
    }

    // Set the errors into the state
    setErrors(allErrors);
  };

  // Function to handle the form submission
  const handleSubmission = (e) => {
    e.preventDefault();
    // POST request
    axiosWithAuth()
      .post("https://airbnb-best-price.herokuapp.com/login", user)
      .then((res) => {
        // Check response data for what to setItem to below
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        push("/listings");
      })
      .catch((err) => console.log("err", err.message));
    // Check for errors first
    formErrors();

    // Check if the form passes the validation
    formSchema.isValid(user).then((valid) => {
      console.log("is my form valid?", valid);

      if (valid) {
        // Ensure to eliminate all errors if form is valid
        setErrors({});

        // Submit the form
        console.log("Form submitted", user);

        // Clear the form
        setUser(defaultUserData);
      } else {
        // Add a little animation if not valid
        const errorAnim = gsap.timeline({ repeat: 0, repeatDelay: 0 });
        errorAnim.to(".form-container", { x: -50, duration: 0.2 });
        errorAnim.to(".form-container", { x: 50, duration: 0.2 });
        errorAnim.to(".form-container", { x: -20, duration: 0.2 });
        errorAnim.to(".form-container", { x: 20, duration: 0.2 });
        errorAnim.to(".form-container", { x: 0, duration: 0.2 });

        // Disable the submit button while the animation plays
        setDisableSubmit(true);

        setTimeout(() => {
          setDisableSubmit(false);
        }, 1000);
      }
    });
  };

  return (
    <div className="form-container">
      <h3>Login Form</h3>

      <form onSubmit={handleSubmission}>
        <label
          htmlFor="username"
          className={`${
            errors.username !== "" && errors.username !== undefined
              ? "invalid"
              : "valid"
          }`}
        >
          Username
          <input
            type="text"
            id="username"
            name="username"
            value={user.username}
            onChange={handleChange}
          />
        </label>

        <label
          htmlFor="password"
          className={`${
            errors.password !== "" && errors.password !== undefined
              ? "invalid"
              : "valid"
          }`}
        >
          Password
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleChange}
          />
        </label>

        <input type="submit" value="Log in" disabled={disableSubmit} />
      </form>

      {Object.keys(errors).length > 0 && (
        <div className="errors">
          {Object.keys(errors).map((key) => (
            <p value={key} key={key}>
              {errors[key]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
