import {Options, prepareDOM, print} from "../tools";
import {Observable} from "rxjs";

const OPTIONS: Options = {
    header: 'Observable either synchronously or asynchronously',
    buttons: [
        { id: 'sync-function', caption: 'sync function' },
        { id: 'sync-observable', caption: 'sync observable' },
        { id: 'async-observable', caption: 'async observable' },
    ]
}
prepareDOM(OPTIONS)

interface Actors<P, C> { producer: P, consumer: C }

{ //synchronous function
    const actors: Actors<() => void, (value: any) => void> = {
        producer: () => 'synchronous value from function',
        consumer: print.bind(null, ['Native'])
    }

    document.getElementById(
        OPTIONS.buttons[0].id
    ).addEventListener(
        'click',
        _ => {
            console.group()

            actors.consumer('before')
            actors.consumer(actors.producer())
            actors.consumer('after')
        }
    )
}

{ //synchronous observable
    const actors: Actors<Observable<string>, (value: any) => void> = {
        producer: new Observable(
            observer => observer.next('synchronous value from Observable')
        ),
        consumer: print.bind(null, ['RxJS'])
    }

    document.getElementById(
        OPTIONS.buttons[1].id
    ).addEventListener(
        'click',
        _ => {
            console.group()

            actors.consumer('before')
            actors.producer.subscribe(actors.consumer)
            actors.consumer('after')
        }
    )
}

{ //asynchronous observable
    const actors: Actors<Observable<string>, (value: any) => void> = {
        producer: new Observable(observer => {
            Promise.resolve(
                'asynchronous value from Observable'
            ).then(observer.next.bind(observer))
        }) ,
        consumer: print.bind(null, ['RxJS'])
    }

    document.getElementById(
        OPTIONS.buttons[2].id
    ).addEventListener(
        'click',
        _ => {
            console.group()

            actors.consumer('before')
            actors.producer.subscribe(actors.consumer)
            actors.consumer('after')
        }
    )
}


