import { ApplicationController } from "./classes/ApplicationController";

async function bootstrap(): Promise<void> {
  const app = new ApplicationController();
  await app.start();
}

bootstrap().catch((error: unknown) => {
  console.error("Ошибка запуска приложения:", error);
});