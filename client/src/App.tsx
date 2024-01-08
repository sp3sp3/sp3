import { ButtonAppBar } from './components/ButtonAppBar'
import { ProjectOverview } from './pages/ProjectOverview'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


import { ThemeOptions } from '@mui/material/styles';
import { Route, Routes } from 'react-router-dom';
import { SubProjectPage } from './pages/SubProject';
import { ExperimentPage } from './pages/Experiment';

export const themeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: '#263238',
        },
        secondary: {
            main: '#f50057',
        },
        background: {
            default: "#fff"
        },
        text: {
            primary: "#000001de",
            secondary: "#00000099",
        }
    },
    typography: {
        // fontFamily: 'Roboto Mono',
    },
};

const theme = createTheme(themeOptions)


function App() {
    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline>
                    <ButtonAppBar />
                    <Routes>
                        <Route path="/" element={<ProjectOverview />} />
                        <Route path="/projects/:id" element={<SubProjectPage />} />
                        <Route path="/projects/:id/experiment/:experiment_id" element={<ExperimentPage />} />
                    </Routes>
                </CssBaseline>
            </ThemeProvider >
        </>
    )
}

export default App
