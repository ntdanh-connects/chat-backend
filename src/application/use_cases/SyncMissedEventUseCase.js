class SyncMissedEventUseCase{
    constructor(eventRepository){
        this.eventRepository = eventRepository;
    }

    async exeucte({ userId, lastSeqId =0, limit = 200 }){
        if(!userId){
            throw new Error("User required");
        }

        const missedEvent = await this.eventRepository.getMissedEvents(userId, lastSeqId, limit);

        return {
            events: missedEvent,
            hasMore: missedEvent.length === limit,
        }
    }
}

module.exports = SyncMissedEventUseCase;