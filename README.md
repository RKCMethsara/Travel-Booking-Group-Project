# 🏝️ Sri Lanka Tourism Website - Enhanced Security Edition

## 🎉 Version 2.0 - Production Ready with Enterprise Security

A modern, secure, and fully-featured tourism website for Sri Lanka with comprehensive booking system, admin dashboard, food ordering, and vehicle hire services.

### ✨ Key Features
- **20+ Destinations** with detailed information and gallery
- **Secure Booking System** with validation and duplicate prevention
- **Admin Dashboard** with role-based access control
- **Food Ordering** - 9 authentic Sri Lankan dishes
- **Vehicle Hire** - 6 vehicle options
- **User Authentication** - Secure login/signup with password hashing
- **My Bookings** - Personal booking dashboard
- **Enterprise Security** - Input validation, XSS protection, rate limiting

### 🛡️ Security Features
- ✅ Complete input validation (email, phone, name, date)
- ✅ XSS attack prevention
- ✅ Rate limiting (prevents brute force)
- ✅ Password hashing
- ✅ Role-based access control
- ✅ Duplicate booking prevention
- ✅ Secure data storage
- ✅ Error handling

How to run

1. Make sure Node.js (>=14) and npm are installed.
2. From project root run:

```powershell
npm install
npm start
```

Open http://localhost:3000 in your browser.

Publishing to GitHub

1. Create a new repository on GitHub.
2. In the project folder run:

```powershell
git init
git add .
git commit -m "Initial frontend for Sri Lanka Tours"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

Notes

- Images are simple SVG placeholders in `public/images` (so app works offline). Replace them with real photos if you like.
- Bookings are saved to `localStorage`. Admin page reads them for demo/testing.
- No backend or payment gateway included as requested — money is collected offline per your instructions.

Next suggestions (optional)

- Add user authentication and a backend API to persist bookings.
- Add better image assets and accessibility improvements.
- Add unit tests and deploy via GitHub Pages, Vercel, or Netlify.

Files added/changed

- `src/data/places.js` — list of 20 places and coordinates.
- `src/components/*` — UI components (NavBar, PlaceCard).
- `src/pages/*` — pages (Home, Destinations, PlacePage, BookNow, Foods, Hire, Login, BookingsView, Admin).
- `public/images/*` — placeholder images used by the app.

If you want, I can also:

- Wire up a minimal Node/Express backend to persist bookings.
- Add real images and polish the UI styles.

Tell me which of these you'd like next.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
