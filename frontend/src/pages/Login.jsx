import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // Handle login form submission
    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const payload = {
                password: data.password,
            };

            // Check whether input is email or username
            if (data.emailOrUsername.includes("@")) {
                payload.email = data.emailOrUsername;
            } else {
                payload.username = data.emailOrUsername;
            }

            const response = await loginUser(payload);

            setSuccessMessage(
                response?.message || "Login successful!"
            );

            // Redirect to homepage after successful login
            setTimeout(() => {
                navigate("/");
            }, 1000);

        } catch (error) {
            setErrorMessage(
                error.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 bg-primary-bg">
            <div className="w-full max-w-md bg-card-bg/40 border border-border-color rounded-3xl shadow-2xl p-8 backdrop-blur-md glass-panel">

                {/* Heading */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-text-primary font-display tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-text-secondary mt-2 text-sm font-medium">
                        Log in to your premium VideoTube account
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-4 rounded-2xl bg-success-green/10 border border-success-green/20 text-success-green text-sm">
                        ✨ {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-4 p-4 rounded-2xl bg-danger-red/10 border border-danger-red/20 text-danger-red text-sm">
                        ⚠️ {errorMessage}
                    </div>
                )}

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    {/* Email or Username */}
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2 font-display">
                            Email or Username
                        </label>

                        <input
                            type="text"
                            placeholder="Enter email or username..."
                            className="w-full px-4 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-sm"
                            {...register("emailOrUsername", {
                                required: "Email or username is required",
                            })}
                        />

                        {errors.emailOrUsername && (
                            <p className="text-danger-red text-xs mt-1.5 font-medium">
                                {errors.emailOrUsername.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-2 font-display">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-sm"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message:
                                        "Password must be at least 6 characters",
                                },
                            })}
                        />

                        {errors.password && (
                            <p className="text-danger-red text-xs mt-1.5 font-medium">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent-hover text-text-primary font-bold py-3 rounded-2xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:scale-[1.01] active:scale-[0.99] text-sm cursor-pointer mt-4"
                    >
                        {loading ? "Verifying..." : "Sign In"}
                    </button>
                </form>

                {/* Signup Redirect */}
                <p className="text-center text-text-muted mt-6 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-accent hover:text-accent-hover font-bold transition duration-200"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;