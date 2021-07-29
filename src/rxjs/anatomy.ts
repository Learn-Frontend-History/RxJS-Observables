import {Options, prepareDOM, print} from "../tools";
import {Observable, scan, Subscription} from "rxjs";

const OPTIONS: Options = {
    header: 'Observable anatomy',
    buttons: [
        { id: 'complete', caption: 'complete observable' },
        { id: 'error', caption: 'error observable' },
        { id: 'subscribe', caption: 'subscribe' },
        { id: 'dispose', caption: 'dispose' },
    ]
}
prepareDOM(OPTIONS)

interface Actors<P, C> { producer: P, consumer: C }

{ // observable complete
    const actors: Actors<Observable<any>, (value: any) => void> = {
        producer: new Observable(observer => {
            observer.next('next 1')
            observer.next('next 2')
            observer.next('next 3')
            observer.complete()
            observer.next('ignored value')
        }),
        consumer: print.bind(null, ['RxJS'])
    }

    document.getElementById(
        OPTIONS.buttons[0].id
    ).addEventListener(
        'click',
        _ => {
            console.group()

            actors.producer.subscribe({
                next: actors.consumer,
                complete: () => actors.consumer('complete')
            })
        }
    )
}

{ // observable error
    const actors: Actors<Observable<any>, (value: any) => void> = {
        producer: new Observable(observer => {
            try {
                observer.next('next 1')
                observer.next('next 2')
                observer.next('next 3')
                throw 'error'
                observer.next('ignored value')
            } catch (e: any) {
                observer.error('error')
            }
        }),
        consumer: print.bind(null, ['RxJS'])
    }

    document.getElementById(
        OPTIONS.buttons[1].id
    ).addEventListener(
        'click',
        _ => {
            console.group()

            actors.producer.subscribe({
                next: actors.consumer,
                error: () => actors.consumer('error')
            })
        }
    )
}

{ // observable dispose
    const actors: Actors<Observable<any>, (value: any) => void> = {
        producer: new Observable(observer => {
            const interval = setInterval(_ => observer.next(1), 1000)

            return () => {
                clearInterval(interval)

                print('RxJS', 'disposed')
            }
        }),
        consumer: print.bind(null, ['RxJS'])
    }

    let subscription: Subscription;

    document.getElementById(
        OPTIONS.buttons[2].id
    ).addEventListener(
        'click',
        _ => {
            console.group()

            subscription = actors.producer.pipe(
                scan(count => ++count, 0)
            ).subscribe(
                actors.consumer
            )
        }
    )

    document.getElementById(
        OPTIONS.buttons[3].id
    ).addEventListener(
        'click',
        _ => subscription.unsubscribe()
    )
}
