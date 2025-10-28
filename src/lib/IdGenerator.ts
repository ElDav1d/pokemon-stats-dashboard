import { v4 as uuidv4 } from "uuid";

export interface IdGenerator {
  generate(): string;
}

export class UuidGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
