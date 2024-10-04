import { ANSI } from "./ansi.mjs";
const ART = `
${ANSI.COLOR.GREEN}   ______  ____   ____    __     ______   ____    __       ______   ___     ___
${ANSI.COLOR.GREEN}  |      ||    | |    | /  ]     |      | /    |  /  ]    |      | /   \\   /  _]
${ANSI.COLOR.BLUE}  |      ||    |   |  | /  /     |      ||  o  | /  /     |      ||     | /  [_
${ANSI.COLOR.BLUE}  |_|  |_||    |   |  |/  /      |_|  |_||     |/  /      |_|  |_||  O  ||    _]
${ANSI.COLOR.BLUE}    |  |  |    |   |  /   \\_       |  |  |  _  /   \\_       |  |  |     ||   [_
${ANSI.COLOR.RED}    |  |  |    |   |  \\     |      |  |  |  |  \\     |      |  |  |     ||     |
${ANSI.COLOR.RED}    |__|  |____|  |____\\____|      |__|  |__|__|\\____|      |__|   \\___/ |_____|

`

function showSplashScreen() {
    console.log(ART);
}

export default showSplashScreen;



