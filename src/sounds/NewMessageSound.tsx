export class NewMessageSound {

    public static play() {
        const audio = new Audio("/new_message-soft.mp3")
        audio.play();

        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
        }, 1000)

        return audio;
    }
}
