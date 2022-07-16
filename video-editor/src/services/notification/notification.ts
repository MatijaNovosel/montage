import { Notify } from "quasar";

export class NotificationService {
  notify(txt: string) {
    Notify.create({
      message: txt
    });
  }
}
