# Looking For Team

An application which helps to find teammates for games.

## Makefile

In order to run integration tests write:

`make test-db`

`make test-int`

In order to run app write:

`make compose-up` or `docker-compose up -d`

## Wiping/seeding data in DB

In order to drop all data write:

`make wipe-data`;

Seeding database requires improvement (Injecting all seed methods as a separate providers so we can use it in a stepper-like class `.step(), .step()...`)
Seeding happens automatically during the first request, it then flags a seeding process as done, so when you wipe all data you'll need to restart the server too (i.e. by saving some file);

## Security

- All routes are by default protected by JwtAuth. If you want to change a single route you need to add a decorator `@Public()`;
- All routes can be checked with a `@Role()` decorator - The higher level of permissions the more user can do

## Notification service

For the invocation of the notification you need to call a `NotificationMedium` which is responsible to propagate further all the notification logic.

### NotificationMedium

In the `NotificationModule` you can attach different types of notifications to it in order to handle it in a different way. Notification consists of a specific `NotificationType` which requires some data payload, user and already knows which handlers it has to invoke in the future to finish the Notification processing.

Config for `NotificationMedium` looks like this:

```
const  config: ReadonlyMap<
	NotificationTypes,
	NotificationHandler[]
> = new  Map<NotificationTypes, NotificationHandler[]>([
	[NotificationTypes.resetPasswordConfirmationLink, [mailHandler]],
	// ...Here you add different notificatino types, all notification types should be placed.
	// Otherwise an error would be thrown
]);
```

### How to trigger a notification?

You can trigger a notification this way:

```
await  this.notificationMedium.sendNotification({
	user,
	type:  NotificationTypes.resetPasswordConfirmationLink,
	data: {
		verificationCode,
	},
});
```

## WebSockets

**TODO:**

## Testing

- Remember to always mirror app changes to test app module.

### Integration tests checks

- Add 404 tests
- 403 - Add check for roles
- Add 401 tests (multiple cases) with and without permissions
- Add 201
- Add 200

## Configs

- GameConfig - contains the config of all games (game can be active or not)
