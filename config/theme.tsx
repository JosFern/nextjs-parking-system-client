import { createTheme } from '@mui/material/styles';
// Create a theme instance.
const theme = createTheme({
    palette: {
        primary: {
            main: '#e1b12c',
        },
        secondary: {
            main: '#192a56',
        },
        error: {
            main: '#c23616',
        },
    },
    typography: {
        "fontFamily": `"Poppins", "Roboto", "Helvetica", "Arial", sans-serif`
    }
});
export default theme;