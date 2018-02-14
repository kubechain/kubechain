class CarElement {
    accept(visitor) {

    }
}

class CarElementVisitor {
    visitBody(body) {
    }

    visitCar(car) {
    }

    visitEngine(engine) {
    }

    visitWheel(wheel) {
    }
}

class Car extends CarElement {
    constructor() {
        super();
        this.elements = [
            new Wheel("front left"), new Wheel("front right"),
            new Wheel("back left"), new Wheel("back right"),
            new Body(), new Engine()
        ];
    }

    accept(visitor) {
        this.elements.forEach(elem => {
            elem.accept(visitor);
        });
        visitor.visitCar(this);
    }
}

class Body extends CarElement {
    accept(visitor) {
        visitor.visitBody(this);
    }
}

class Engine extends CarElement {
    accept(visitor) {
        visitor.visitEngine(this);
    }
}

class Wheel extends CarElement {
    constructor(name) {
        super();
        this._name = name;
    }

    getName() {
        return this._name;
    }

    accept(visitor) {
        /*
         * accept(CarElementVisitor) in Wheel implements
         * accept(CarElementVisitor) in CarElement, so the call
         * to accept is bound at run time. This can be considered
         * the *first* dispatch. However, the decision to call
         * visit(Wheel) (as opposed to visit(Engine) etc.) can be
         * made during compile time since 'this' is known at compile
         * time to be a Wheel. Moreover, each implementation of
         * CarElementVisitor implements the visit(Wheel), which is
         * another decision that is made at run time. This can be
         * considered the *second* dispatch.
         */
        visitor.visitWheel(this);
    }
}

class CarElementDoVisitor extends CarElementVisitor {
    visitBody(body) {
        console.info("Moving my body");
    }

    visitCar(car) {
        console.info("Starting my car");
    }

    visitWheel(wheel) {
        console.info("Kicking my " + wheel.getName() + " wheel");
    }

    visitEngine(engine) {
        console.info("Starting my engine");
    }
}

class CarElementPrintVisitor extends CarElementVisitor {
    visitBody(body) {
        console.info("Visiting body");
    }

    visitCar(car) {
        console.info("Visiting car");
    }

    visitEngine(engine) {
        console.info("Visiting engine");
    }

    visitWheel(wheel) {
        console.info("Visiting " + wheel.getName() + " wheel");
    }
}

const car = new Car();

car.accept(new CarElementPrintVisitor());
car.accept(new CarElementDoVisitor());