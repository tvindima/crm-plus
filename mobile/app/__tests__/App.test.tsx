import { render } from "@testing-library/react-native";
import App from "../App";

test("renders welcome copy", () => {
  const { getByText } = render(<App />);
  expect(getByText(/CRM PLUS Mobile/i)).toBeTruthy();
});
