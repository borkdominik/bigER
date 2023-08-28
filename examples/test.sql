CREATE TABLE Customer (
	id BIGINT NOT NULL,	-- type mapped from: int; added NULL constraint
	name VARCHAR,	-- type mapped from: string
	PRIMARY KEY (id)
);
CREATE TABLE Order (
	order_number BIGINT NOT NULL,	-- type mapped from: int; added NULL constraint
	price double,
	PRIMARY KEY (order_number)
);
CREATE TABLE Places (
	id BIGINT NOT NULL,	-- type mapped from: int; added NULL constraint
	order_number BIGINT NOT NULL,	-- type mapped from: int; added NULL constraint
	PRIMARY KEY (id, order_number),
	FOREIGN KEY (id) REFERENCES Customer (id) ON DELETE CASCADE,
	FOREIGN KEY (order_number) REFERENCES Order (order_number) ON DELETE CASCADE
);