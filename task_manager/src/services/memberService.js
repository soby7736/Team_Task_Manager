
import axios from "axios";

export async function getMembers() {
  const response = await axios.get(
    "https://dummyjson.com/users?limit=10"
  );

  return response.data.users;
}
