import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Signup() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    // Watch avatar file input
    const avatarFile = watch("avatar");

    // Handle avatar preview
    const handleAvatarPreview = (event) => {
        const file = event.target.files[0];

        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Handle form submission
    const onSubmit = async (data) => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            // Create FormData for multipart/form-data
            const formData = new FormData();

            formData.append("fullName", data.fullName);
            formData.append("username", data.username);
            formData.append("email", data.email);
            formData.append("password", data.password);

            // Required avatar image
            formData.append("avatar", data.avatar[0]);

            // Optional cover image
            if (data.coverImage?.[0]) {
                formData.append("coverImage", data.coverImage[0]);
            }

            const response = await registerUser(formData);

            setSuccessMessage(
                response?.message || "Account created successfully!"
            );

            // Redirect to login page
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            setErrorMessage(
                error.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[75vh] flex items-center justify-center px-4 py-10 bg-primary-bg">
            <div className="w-full max-w-lg bg-card-bg/40 border border-border-color rounded-3xl shadow-2xl p-8 backdrop-blur-md glass-panel">

                {/* Heading */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-text-primary font-display tracking-tight">
                        Create Account
                    </h1>
                    <p className="text-text-secondary mt-2 text-sm font-medium">
                        Join the premium VideoTube community today
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

                {/* Signup Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >

                    {/* Full Name */}
                    <div>
                        <label className="block text-text-primary mb-2 text-sm font-semibold font-display">
                            Full Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your full name..."
                            className="w-full px-4 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-sm"
                            {...register("fullName", {
                                required: "Full name is required",
                            })}
                        />

                        {errors.fullName && (
                            <p className="text-danger-red text-xs mt-1.5 font-medium">
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-text-primary mb-2 text-sm font-semibold font-display">
                            Username
                        </label>

                        <input
                            type="text"
                            placeholder="Enter username..."
                            className="w-full px-4 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-sm"
                            {...register("username", {
                                required: "Username is required",
                            })}
                        />

                        {errors.username && (
                            <p className="text-danger-red text-xs mt-1.5 font-medium">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-text-primary mb-2 text-sm font-semibold font-display">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-sm"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value:
                                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format",
                                },
                            })}
                        />

                        {errors.email && (
                            <p className="text-danger-red text-xs mt-1.5 font-medium">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-text-primary mb-2 text-sm font-semibold font-display">
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

                    {/* Avatar Upload */}
                    <div className="border border-border-color rounded-2xl p-4 bg-primary-bg/20">
                        <label className="block text-text-primary mb-2 text-sm font-semibold font-display">
                            Avatar Image
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            className="w-full text-text-secondary text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-text-primary file:hover:bg-white/10 transition file:cursor-pointer"
                            {...register("avatar", {
                                required: "Avatar image is required",
                            })}
                            onChange={handleAvatarPreview}
                        />

                        {errors.avatar && (
                            <p className="text-danger-red text-xs mt-2 font-medium">
                                {errors.avatar.message}
                            </p>
                        )}

                        {/* Avatar Preview */}
                        {avatarPreview && (
                            <div className="mt-4 flex justify-center">
                                <img
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-accent accent-glow"
                                />
                            </div>
                        )}
                    </div>

                    {/* Cover Image Upload */}
                    <div className="border border-border-color rounded-2xl p-4 bg-primary-bg/20">
                        <label className="block text-text-primary mb-2 text-sm font-semibold font-display">
                            Cover Image (Optional)
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            className="w-full text-text-secondary text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-text-primary file:hover:bg-white/10 transition file:cursor-pointer"
                            {...register("coverImage")}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent-hover text-text-primary font-bold py-3 rounded-2xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:scale-[1.01] active:scale-[0.99] text-sm cursor-pointer mt-4"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                {/* Login Redirect */}
                <p className="text-center text-text-muted mt-6 text-sm">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-accent hover:text-accent-hover font-bold transition duration-200"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;